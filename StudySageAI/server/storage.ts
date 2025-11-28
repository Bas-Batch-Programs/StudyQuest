import {
  users,
  documents,
  flashcardSets,
  flashcards,
  quizzes,
  quizQuestions,
  quizAttempts,
  studySessions,
  achievements,
  userAchievements,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type FlashcardSet,
  type InsertFlashcardSet,
  type Flashcard,
  type InsertFlashcard,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type StudySession,
  type InsertStudySession,
  calculateLevel,
  FREE_TIER_DAILY_FLASHCARDS,
  FREE_TIER_DAILY_QUIZZES,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<User>;
  updateUserStreak(userId: string): Promise<User>;
  incrementDailyUsage(userId: string, type: "flashcards" | "quizzes"): Promise<void>;
  checkDailyLimit(userId: string, type: "flashcards" | "quizzes"): Promise<boolean>;

  // Document operations
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: string): Promise<Document[]>;

  // Flashcard operations
  createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet>;
  getFlashcardSet(id: number): Promise<(FlashcardSet & { flashcards: Flashcard[] }) | undefined>;
  getFlashcardSetsByUser(userId: string): Promise<(FlashcardSet & { flashcards: Flashcard[] })[]>;
  createFlashcard(card: InsertFlashcard): Promise<Flashcard>;
  updateFlashcardSetCount(setId: number): Promise<void>;

  // Quiz operations
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuiz(id: number): Promise<(Quiz & { questions: QuizQuestion[] }) | undefined>;
  getQuizzesByUser(userId: string): Promise<(Quiz & { questions: QuizQuestion[] })[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestionCount(quizId: number): Promise<void>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;

  // Study session operations
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  getStudySessionsByUser(userId: string, limit?: number): Promise<StudySession[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newTotalXp = (user.totalXp || 0) + xpToAdd;
    const newLevel = calculateLevel(newTotalXp);

    const [updatedUser] = await db
      .update(users)
      .set({
        totalXp: newTotalXp,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async updateUserStreak(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);
    }

    let newStreak = user.currentStreak || 0;
    
    if (!lastStudy) {
      // First study ever
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Already studied today, streak unchanged
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else {
        // Streak broken, start new
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(user.longestStreak || 0, newStreak);

    const [updatedUser] = await db
      .update(users)
      .set({
        currentStreak: newStreak,
        longestStreak: longestStreak,
        lastStudyDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  async incrementDailyUsage(userId: string, type: "flashcards" | "quizzes"): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Check if we need to reset daily counters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.lastDailyReset ? new Date(user.lastDailyReset) : null;
    
    let resetNeeded = false;
    if (!lastReset || lastReset < today) {
      resetNeeded = true;
    }

    if (resetNeeded) {
      await db
        .update(users)
        .set({
          dailyFlashcardsUsed: type === "flashcards" ? 1 : 0,
          dailyQuizzesUsed: type === "quizzes" ? 1 : 0,
          lastDailyReset: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      const updateField = type === "flashcards" 
        ? { dailyFlashcardsUsed: (user.dailyFlashcardsUsed || 0) + 1 }
        : { dailyQuizzesUsed: (user.dailyQuizzesUsed || 0) + 1 };
      
      await db
        .update(users)
        .set({
          ...updateField,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  async checkDailyLimit(userId: string, type: "flashcards" | "quizzes"): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    // Premium users have no limits
    if (user.isPremium) return true;

    // Check if we need to reset daily counters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = user.lastDailyReset ? new Date(user.lastDailyReset) : null;
    
    if (!lastReset || lastReset < today) {
      // Counters would be reset, so within limit
      return true;
    }

    const limit = type === "flashcards" ? FREE_TIER_DAILY_FLASHCARDS : FREE_TIER_DAILY_QUIZZES;
    const used = type === "flashcards" ? (user.dailyFlashcardsUsed || 0) : (user.dailyQuizzesUsed || 0);

    return used < limit;
  }

  // Document operations
  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }

  // Flashcard operations
  async createFlashcardSet(set: InsertFlashcardSet): Promise<FlashcardSet> {
    const [flashcardSet] = await db.insert(flashcardSets).values(set).returning();
    return flashcardSet;
  }

  async getFlashcardSet(id: number): Promise<(FlashcardSet & { flashcards: Flashcard[] }) | undefined> {
    const [set] = await db.select().from(flashcardSets).where(eq(flashcardSets.id, id));
    if (!set) return undefined;

    const cards = await db.select().from(flashcards).where(eq(flashcards.setId, id));
    return { ...set, flashcards: cards };
  }

  async getFlashcardSetsByUser(userId: string): Promise<(FlashcardSet & { flashcards: Flashcard[] })[]> {
    const sets = await db.select().from(flashcardSets).where(eq(flashcardSets.userId, userId)).orderBy(desc(flashcardSets.createdAt));
    
    const result = await Promise.all(
      sets.map(async (set) => {
        const cards = await db.select().from(flashcards).where(eq(flashcards.setId, set.id));
        return { ...set, flashcards: cards };
      })
    );
    
    return result;
  }

  async createFlashcard(card: InsertFlashcard): Promise<Flashcard> {
    const [flashcard] = await db.insert(flashcards).values(card).returning();
    return flashcard;
  }

  async updateFlashcardSetCount(setId: number): Promise<void> {
    const cards = await db.select().from(flashcards).where(eq(flashcards.setId, setId));
    await db
      .update(flashcardSets)
      .set({ cardCount: cards.length })
      .where(eq(flashcardSets.id, setId));
  }

  // Quiz operations
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [createdQuiz] = await db.insert(quizzes).values(quiz).returning();
    return createdQuiz;
  }

  async getQuiz(id: number): Promise<(Quiz & { questions: QuizQuestion[] }) | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    if (!quiz) return undefined;

    const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, id));
    return { ...quiz, questions };
  }

  async getQuizzesByUser(userId: string): Promise<(Quiz & { questions: QuizQuestion[] })[]> {
    const quizList = await db.select().from(quizzes).where(eq(quizzes.userId, userId)).orderBy(desc(quizzes.createdAt));
    
    const result = await Promise.all(
      quizList.map(async (quiz) => {
        const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
        return { ...quiz, questions };
      })
    );
    
    return result;
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [createdQuestion] = await db.insert(quizQuestions).values(question).returning();
    return createdQuestion;
  }

  async updateQuizQuestionCount(quizId: number): Promise<void> {
    const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
    await db
      .update(quizzes)
      .set({ questionCount: questions.length })
      .where(eq(quizzes.id, quizId));
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [createdAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return createdAttempt;
  }

  // Study session operations
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const [createdSession] = await db.insert(studySessions).values(session).returning();
    return createdSession;
  }

  async getStudySessionsByUser(userId: string, limit: number = 10): Promise<StudySession[]> {
    return db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.completedAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
