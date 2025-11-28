import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateFlashcards, generateQuiz, extractDocumentTitle } from "./openai";
import { XP_PER_FLASHCARD, XP_PER_QUIZ_QUESTION, XP_BONUS_PERFECT_QUIZ } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, TXT, and DOCX are allowed."));
    }
  },
});

// Parse document content based on file type
async function parseDocument(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }
  
  if (mimetype === "application/pdf") {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return data.text;
  }
  
  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  
  throw new Error("Unsupported file type");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - public endpoint that returns null for unauthenticated users
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }

      const user = req.user as any;
      const now = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (user.expires_at && now > user.expires_at) {
        // Try to refresh token
        if (user.refresh_token) {
          try {
            const client = await import("openid-client");
            const memoize = await import("memoizee");
            const getOidcConfig = memoize.default(
              async () => {
                return await client.discovery(
                  new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
                  process.env.REPL_ID!
                );
              },
              { maxAge: 3600 * 1000 }
            );
            const config = await getOidcConfig();
            const tokenResponse = await client.refreshTokenGrant(config, user.refresh_token);
            user.claims = tokenResponse.claims();
            user.access_token = tokenResponse.access_token;
            user.refresh_token = tokenResponse.refresh_token;
            user.expires_at = user.claims?.exp;
          } catch (error) {
            return res.json(null);
          }
        } else {
          return res.json(null);
        }
      }

      const userId = req.user.claims.sub;
      const dbUser = await storage.getUser(userId);
      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // Document upload
  app.post("/api/documents/upload", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const content = await parseDocument(req.file.buffer, req.file.mimetype);
      
      if (!content || content.trim().length < 50) {
        return res.status(400).json({ message: "Document content is too short or empty" });
      }

      // Extract file type
      let fileType = "txt";
      if (req.file.mimetype === "application/pdf") fileType = "pdf";
      else if (req.file.mimetype.includes("wordprocessingml")) fileType = "docx";

      // Generate title from content
      const title = await extractDocumentTitle(content);

      const document = await storage.createDocument({
        userId,
        title,
        content,
        fileType,
      });

      res.json(document);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: error.message || "Failed to upload document" });
    }
  });

  // Get user's documents
  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Generate flashcards from document
  app.post("/api/documents/:id/generate-flashcards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);

      // Check daily limit
      const withinLimit = await storage.checkDailyLimit(userId, "flashcards");
      if (!withinLimit) {
        return res.status(403).json({ 
          message: "Daily flashcard limit reached. Upgrade to Premium for unlimited access!" 
        });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Generate flashcards using AI
      const generatedCards = await generateFlashcards(document.content, 10);

      // Create flashcard set
      const flashcardSet = await storage.createFlashcardSet({
        userId,
        documentId,
        title: `${document.title} - Flashcards`,
        description: `Generated from ${document.title}`,
      });

      // Create individual flashcards
      for (const card of generatedCards) {
        await storage.createFlashcard({
          setId: flashcardSet.id,
          front: card.front,
          back: card.back,
          explanation: card.explanation,
        });
      }

      // Update card count
      await storage.updateFlashcardSetCount(flashcardSet.id);

      // Increment daily usage
      await storage.incrementDailyUsage(userId, "flashcards");

      // Return the complete set
      const completeSet = await storage.getFlashcardSet(flashcardSet.id);
      res.json(completeSet);
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      res.status(500).json({ message: error.message || "Failed to generate flashcards" });
    }
  });

  // Generate quiz from document
  app.post("/api/documents/:id/generate-quiz", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);

      // Check daily limit
      const withinLimit = await storage.checkDailyLimit(userId, "quizzes");
      if (!withinLimit) {
        return res.status(403).json({ 
          message: "Daily quiz limit reached. Upgrade to Premium for unlimited access!" 
        });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Generate quiz using AI
      const generatedQuestions = await generateQuiz(document.content, 10);

      // Create quiz
      const quiz = await storage.createQuiz({
        userId,
        documentId,
        title: `${document.title} - Quiz`,
      });

      // Create questions
      for (const question of generatedQuestions) {
        await storage.createQuizQuestion({
          quizId: quiz.id,
          type: question.type,
          question: question.question,
          options: question.options || null,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });
      }

      // Update question count
      await storage.updateQuizQuestionCount(quiz.id);

      // Increment daily usage
      await storage.incrementDailyUsage(userId, "quizzes");

      // Return the complete quiz
      const completeQuiz = await storage.getQuiz(quiz.id);
      res.json(completeQuiz);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: error.message || "Failed to generate quiz" });
    }
  });

  // Get user's flashcard sets
  app.get("/api/flashcard-sets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sets = await storage.getFlashcardSetsByUser(userId);
      res.json(sets);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
      res.status(500).json({ message: "Failed to fetch flashcard sets" });
    }
  });

  // Get specific flashcard set
  app.get("/api/flashcard-sets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const setId = parseInt(req.params.id);
      const set = await storage.getFlashcardSet(setId);
      
      if (!set) {
        return res.status(404).json({ message: "Flashcard set not found" });
      }
      
      if (set.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(set);
    } catch (error) {
      console.error("Error fetching flashcard set:", error);
      res.status(500).json({ message: "Failed to fetch flashcard set" });
    }
  });

  // Complete flashcard study session
  app.post("/api/flashcard-sets/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const setId = parseInt(req.params.id);
      const { cardsStudied, correctAnswers } = req.body;

      const set = await storage.getFlashcardSet(setId);
      if (!set || set.userId !== userId) {
        return res.status(404).json({ message: "Flashcard set not found" });
      }

      // Calculate XP
      const xpEarned = cardsStudied * XP_PER_FLASHCARD;

      // Create study session
      await storage.createStudySession({
        userId,
        type: "flashcard",
        referenceId: setId,
        xpEarned,
        cardsStudied,
        correctAnswers,
      });

      // Update user XP and streak
      await storage.updateUserXP(userId, xpEarned);
      await storage.updateUserStreak(userId);

      const user = await storage.getUser(userId);
      res.json({ xpEarned, user });
    } catch (error) {
      console.error("Error completing flashcard session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  // Get user's quizzes
  app.get("/api/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizzes = await storage.getQuizzesByUser(userId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get specific quiz
  app.get("/api/quizzes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      if (quiz.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Complete quiz
  app.post("/api/quizzes/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizId = parseInt(req.params.id);
      const { score, totalQuestions } = req.body;

      const quiz = await storage.getQuiz(quizId);
      if (!quiz || quiz.userId !== userId) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Calculate XP
      const isPerfect = score === totalQuestions;
      const xpEarned = (score * XP_PER_QUIZ_QUESTION) + (isPerfect ? XP_BONUS_PERFECT_QUIZ : 0);

      // Create quiz attempt
      await storage.createQuizAttempt({
        userId,
        quizId,
        score,
        totalQuestions,
        xpEarned,
      });

      // Create study session
      await storage.createStudySession({
        userId,
        type: "quiz",
        referenceId: quizId,
        xpEarned,
        cardsStudied: totalQuestions,
        correctAnswers: score,
      });

      // Update user XP and streak
      await storage.updateUserXP(userId, xpEarned);
      await storage.updateUserStreak(userId);

      const user = await storage.getUser(userId);
      res.json({ xpEarned, user });
    } catch (error) {
      console.error("Error completing quiz:", error);
      res.status(500).json({ message: "Failed to complete quiz" });
    }
  });

  // Get user's study sessions
  app.get("/api/study-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getStudySessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
      res.status(500).json({ message: "Failed to fetch study sessions" });
    }
  });

  // Upgrade to premium (redirect to Stripe)
  app.get("/api/upgrade", isAuthenticated, async (req: any, res) => {
    const stripePaymentLink = process.env.STRIPE_PAYMENT_LINK;
    if (!stripePaymentLink) {
      return res.status(500).json({ message: "Payment not configured" });
    }
    res.redirect(stripePaymentLink);
  });

  return httpServer;
}
