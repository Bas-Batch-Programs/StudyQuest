import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false),
  totalXp: integer("total_xp").default(0),
  level: integer("level").default(1),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastStudyDate: timestamp("last_study_date"),
  dailyFlashcardsUsed: integer("daily_flashcards_used").default(0),
  dailyQuizzesUsed: integer("daily_quizzes_used").default(0),
  lastDailyReset: timestamp("last_daily_reset").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents uploaded by users
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  fileType: varchar("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Flashcard sets generated from documents
export const flashcardSets = pgTable("flashcard_sets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentId: integer("document_id").references(() => documents.id),
  title: varchar("title").notNull(),
  description: text("description"),
  cardCount: integer("card_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual flashcards
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  setId: integer("set_id").notNull().references(() => flashcardSets.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  explanation: text("explanation"),
  timesStudied: integer("times_studied").default(0),
  timesCorrect: integer("times_correct").default(0),
  lastStudied: timestamp("last_studied"),
});

// Quizzes generated from documents
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentId: integer("document_id").references(() => documents.id),
  title: varchar("title").notNull(),
  questionCount: integer("question_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  type: varchar("type").notNull(), // 'multiple_choice', 'true_false', 'fill_blank'
  question: text("question").notNull(),
  options: jsonb("options"), // Array of options for multiple choice
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
});

// Quiz attempts/results
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Study sessions for tracking activity
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'flashcard', 'quiz'
  referenceId: integer("reference_id"), // flashcard set or quiz id
  xpEarned: integer("xp_earned").default(0),
  cardsStudied: integer("cards_studied").default(0),
  correctAnswers: integer("correct_answers").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Achievements/Badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  xpReward: integer("xp_reward").default(0),
  requirement: jsonb("requirement"), // e.g., { type: 'streak', value: 7 }
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  flashcardSets: many(flashcardSets),
  quizzes: many(quizzes),
  quizAttempts: many(quizAttempts),
  studySessions: many(studySessions),
  achievements: many(userAchievements),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  flashcardSets: many(flashcardSets),
  quizzes: many(quizzes),
}));

export const flashcardSetsRelations = relations(flashcardSets, ({ one, many }) => ({
  user: one(users, { fields: [flashcardSets.userId], references: [users.id] }),
  document: one(documents, { fields: [flashcardSets.documentId], references: [documents.id] }),
  flashcards: many(flashcards),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  set: one(flashcardSets, { fields: [flashcards.setId], references: [flashcardSets.id] }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  user: one(users, { fields: [quizzes.userId], references: [users.id] }),
  document: one(documents, { fields: [quizzes.documentId], references: [documents.id] }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, { fields: [quizQuestions.quizId], references: [quizzes.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, { fields: [studySessions.userId], references: [users.id] }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertFlashcardSetSchema = createInsertSchema(flashcardSets).omit({ id: true, createdAt: true });
export const insertFlashcardSchema = createInsertSchema(flashcards).omit({ id: true });
export const insertQuizSchema = createInsertSchema(quizzes).omit({ id: true, createdAt: true });
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({ id: true });
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true, completedAt: true });
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({ id: true, completedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type FlashcardSet = typeof flashcardSets.$inferSelect;
export type InsertFlashcardSet = z.infer<typeof insertFlashcardSetSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

// XP and Level constants
export const XP_PER_FLASHCARD = 5;
export const XP_PER_QUIZ_QUESTION = 10;
export const XP_BONUS_PERFECT_QUIZ = 25;
export const XP_STREAK_BONUS = 10;

export function calculateLevel(xp: number): number {
  // Level formula: each level requires progressively more XP
  // Level 1: 0-99, Level 2: 100-249, Level 3: 250-449, etc.
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number): number {
  // XP required to reach a specific level
  return 50 * Math.pow(level - 1, 2);
}

export function xpForNextLevel(currentXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpIntoLevel = currentXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    progress: (xpIntoLevel / xpNeeded) * 100,
  };
}

// Free tier limits
export const FREE_TIER_DAILY_FLASHCARDS = 10;
export const FREE_TIER_DAILY_QUIZZES = 5;
