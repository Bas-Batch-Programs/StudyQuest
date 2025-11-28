import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DocumentUpload } from "@/components/DocumentUpload";
import { FlashcardStudy } from "@/components/FlashcardStudy";
import { QuizInterface } from "@/components/QuizInterface";
import { XPProgressBar } from "@/components/XPProgressBar";
import { StreakDisplay } from "@/components/StreakDisplay";
import { LevelBadge } from "@/components/LevelBadge";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BookOpen, 
  Flame,
  FileText,
  HelpCircle,
  Crown,
  LogOut,
  Settings,
  ChevronRight,
  Calendar,
  Trophy,
  Zap,
  Clock
} from "lucide-react";
import type { FlashcardSet, Flashcard, Quiz, QuizQuestion, StudySession } from "@shared/schema";
import { Link } from "wouter";

type StudyMode = "none" | "flashcards" | "quiz";

interface FlashcardSetWithCards extends FlashcardSet {
  flashcards: Flashcard[];
}

interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [studyMode, setStudyMode] = useState<StudyMode>("none");
  const [activeSet, setActiveSet] = useState<FlashcardSetWithCards | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizWithQuestions | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(user?.level || 1);

  // Check for level up
  if (user && user.level > previousLevel) {
    setShowLevelUp(true);
    setPreviousLevel(user.level);
  }

  const { data: flashcardSets, isLoading: loadingSets } = useQuery<FlashcardSetWithCards[]>({
    queryKey: ["/api/flashcard-sets"],
  });

  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<QuizWithQuestions[]>({
    queryKey: ["/api/quizzes"],
  });

  const { data: recentSessions } = useQuery<StudySession[]>({
    queryKey: ["/api/study-sessions"],
  });

  const handleStartFlashcards = (set: FlashcardSetWithCards) => {
    setActiveSet(set);
    setStudyMode("flashcards");
  };

  const handleStartQuiz = (quiz: QuizWithQuestions) => {
    setActiveQuiz(quiz);
    setStudyMode("quiz");
  };

  const handleBackToDashboard = () => {
    setStudyMode("none");
    setActiveSet(null);
    setActiveQuiz(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-64 h-32" />
      </div>
    );
  }

  // Render study modes
  if (studyMode === "flashcards" && activeSet) {
    return (
      <div className="min-h-screen bg-background p-6">
        <FlashcardStudy
          flashcardSet={activeSet}
          onComplete={handleBackToDashboard}
          onBack={handleBackToDashboard}
        />
        <LevelUpCelebration
          isOpen={showLevelUp}
          newLevel={user.level}
          onClose={() => setShowLevelUp(false)}
        />
      </div>
    );
  }

  if (studyMode === "quiz" && activeQuiz) {
    return (
      <div className="min-h-screen bg-background p-6">
        <QuizInterface
          quiz={activeQuiz}
          onComplete={handleBackToDashboard}
          onBack={handleBackToDashboard}
        />
        <LevelUpCelebration
          isOpen={showLevelUp}
          newLevel={user.level}
          onClose={() => setShowLevelUp(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:inline">StudyBuddy</span>
          </div>

          <div className="flex items-center gap-4">
            <StreakDisplay
              currentStreak={user.currentStreak || 0}
              longestStreak={user.longestStreak || 0}
              lastStudyDate={user.lastStudyDate?.toString() || null}
              compact
            />
            
            <XPProgressBar
              totalXp={user.totalXp || 0}
              level={user.level || 1}
              compact
            />

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="object-cover" />
                    <AvatarFallback>{user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    <LevelBadge level={user.level || 1} size="sm" showIcon={false} />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user.firstName || "User"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {!user.isPremium && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="flex items-center gap-2 cursor-pointer">
                        <Crown className="h-4 w-4" />
                        Upgrade to Premium
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="flex items-center gap-2 cursor-pointer" data-testid="button-logout">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Banner */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user.firstName || "Learner"}!
                </h1>
                <p className="text-muted-foreground">
                  {user.currentStreak && user.currentStreak > 0 
                    ? `You're on a ${user.currentStreak} day streak! Keep it up!`
                    : "Start studying today to begin a streak!"}
                </p>
              </div>
              {user.isPremium && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Premium
                </div>
              )}
            </div>

            {/* Document Upload */}
            <DocumentUpload
              isPremium={user.isPremium || false}
              dailyFlashcardsUsed={user.dailyFlashcardsUsed || 0}
              dailyQuizzesUsed={user.dailyQuizzesUsed || 0}
            />

            {/* Study Materials Tabs */}
            <Tabs defaultValue="flashcards" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="flashcards" className="flex items-center gap-2" data-testid="tab-flashcards">
                  <BookOpen className="h-4 w-4" />
                  Flashcards
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="flex items-center gap-2" data-testid="tab-quizzes">
                  <HelpCircle className="h-4 w-4" />
                  Quizzes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flashcards" className="mt-6">
                {loadingSets ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : flashcardSets && flashcardSets.length > 0 ? (
                  <div className="space-y-4">
                    {flashcardSets.map((set) => (
                      <Card 
                        key={set.id} 
                        className="hover-elevate cursor-pointer"
                        onClick={() => handleStartFlashcards(set)}
                        data-testid={`flashcard-set-${set.id}`}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{set.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {set.cardCount || set.flashcards?.length || 0} cards
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="flex items-center gap-1">
                            Study
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No flashcard sets yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a document above to generate your first flashcard set!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quizzes" className="mt-6">
                {loadingQuizzes ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : quizzes && quizzes.length > 0 ? (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <Card 
                        key={quiz.id} 
                        className="hover-elevate cursor-pointer"
                        onClick={() => handleStartQuiz(quiz)}
                        data-testid={`quiz-${quiz.id}`}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <HelpCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{quiz.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {quiz.questionCount || quiz.questions?.length || 0} questions
                              </p>
                            </div>
                          </div>
                          <Button size="sm" className="flex items-center gap-1">
                            Start
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No quizzes yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a document and generate a quiz to test your knowledge!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level & XP Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <LevelBadge level={user.level || 1} size="lg" />
                  <div>
                    <p className="font-semibold">Level {user.level || 1}</p>
                    <p className="text-sm text-muted-foreground">{user.totalXp || 0} total XP</p>
                  </div>
                </div>
                <XPProgressBar totalXp={user.totalXp || 0} level={user.level || 1} />
              </CardContent>
            </Card>

            {/* Streak Card */}
            <StreakDisplay
              currentStreak={user.currentStreak || 0}
              longestStreak={user.longestStreak || 0}
              lastStudyDate={user.lastStudyDate?.toString() || null}
            />

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{user.dailyFlashcardsUsed || 0}</p>
                    <p className="text-xs text-muted-foreground">Flashcards</p>
                    {!user.isPremium && (
                      <p className="text-xs text-muted-foreground">/ 10</p>
                    )}
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{user.dailyQuizzesUsed || 0}</p>
                    <p className="text-xs text-muted-foreground">Quizzes</p>
                    {!user.isPremium && (
                      <p className="text-xs text-muted-foreground">/ 5</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade CTA for free users */}
            {!user.isPremium && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="pt-6 text-center">
                  <Crown className="h-10 w-10 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Unlock Unlimited Learning</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get unlimited flashcards, quizzes, and advanced features for just $4/month
                  </p>
                  <Button asChild className="w-full" data-testid="button-upgrade">
                    <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {recentSessions && recentSessions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {session.type === "flashcard" ? (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="capitalize">{session.type}</span>
                        </div>
                        <span className="text-primary font-medium">+{session.xpEarned} XP</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <LevelUpCelebration
        isOpen={showLevelUp}
        newLevel={user.level}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
}
