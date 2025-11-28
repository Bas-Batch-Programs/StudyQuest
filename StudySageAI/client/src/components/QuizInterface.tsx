import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { XPGainAnimation } from "./XPGainAnimation";
import { 
  ChevronLeft, 
  Check, 
  X, 
  HelpCircle,
  Trophy,
  RotateCcw,
  Sparkles
} from "lucide-react";
import type { Quiz, QuizQuestion } from "@shared/schema";
import { XP_PER_QUIZ_QUESTION, XP_BONUS_PERFECT_QUIZ } from "@shared/schema";

interface QuizInterfaceProps {
  quiz: Quiz & { questions: QuizQuestion[] };
  onComplete: () => void;
  onBack: () => void;
}

interface QuizAnswer {
  questionId: number;
  answer: string;
  isCorrect: boolean;
}

export function QuizInterface({ quiz, onComplete, onBack }: QuizInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  
  const correctCount = answers.filter(a => a.isCorrect).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const isPerfect = correctCount === questions.length;
  const totalXP = correctCount * XP_PER_QUIZ_QUESTION + (isPerfect ? XP_BONUS_PERFECT_QUIZ : 0);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/quizzes/${quiz.id}/complete`, {
        score: correctCount,
        totalQuestions: questions.length,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const handleAnswer = (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    setAnswers([...answers, {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
    }]);

    if (isCorrect) {
      setLastXP(XP_PER_QUIZ_QUESTION);
      setShowXP(true);
    }
    
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setFillAnswer("");
      setShowFeedback(false);
    } else {
      // Quiz complete
      setIsComplete(true);
      submitMutation.mutate();
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFillAnswer("");
    setShowFeedback(false);
    setIsComplete(false);
  };

  if (!currentQuestion && !isComplete) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-xl font-medium mb-2">No questions available</p>
        <Button onClick={onBack} data-testid="button-back-to-quizzes">
          Back to Quizzes
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
        data-testid="quiz-results"
      >
        <Card>
          <CardContent className="pt-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
            >
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
                isPerfect 
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500" 
                  : score >= 70 
                    ? "bg-gradient-to-br from-green-400 to-green-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
              }`}>
                {isPerfect ? (
                  <Trophy className="h-10 w-10 text-white" />
                ) : (
                  <span className="text-2xl font-bold text-white">{score}%</span>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-2">
                {isPerfect ? "Perfect Score!" : score >= 70 ? "Great Job!" : "Keep Practicing!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                You got {correctCount} out of {questions.length} questions correct
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-primary/10 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-xl font-bold">+{totalXP} XP</span>
              </div>
              {isPerfect && (
                <p className="text-sm text-muted-foreground mt-1">
                  Includes +{XP_BONUS_PERFECT_QUIZ} bonus for perfect score!
                </p>
              )}
            </motion.div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium">Question Breakdown</p>
              <div className="flex flex-wrap justify-center gap-2">
                {answers.map((answer, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      answer.isCorrect
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleRetry}
                className="flex-1"
                data-testid="button-retry-quiz"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={onComplete} 
                className="flex-1"
                data-testid="button-finish-quiz"
              >
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const options = currentQuestion.options as string[] | null;

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="quiz-interface">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} data-testid="button-back">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="font-semibold">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="w-16" />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card className="relative">
        <XPGainAnimation
          amount={lastXP}
          isVisible={showXP}
          onComplete={() => setShowXP(false)}
        />
        
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentQuestion.type === "multiple_choice" 
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : currentQuestion.type === "true_false"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            }`}>
              {currentQuestion.type === "multiple_choice" 
                ? "Multiple Choice" 
                : currentQuestion.type === "true_false" 
                  ? "True/False" 
                  : "Fill in the Blank"}
            </span>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {currentQuestion.type === "multiple_choice" && options && (
            <div className="space-y-2">
              {options.map((option, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    showFeedback
                      ? option === currentQuestion.correctAnswer
                        ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                        : selectedAnswer === option
                          ? "bg-red-100 border-red-500 dark:bg-red-900/30"
                          : "opacity-50"
                      : selectedAnswer === option
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  whileHover={!showFeedback ? { scale: 1.01 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                  data-testid={`option-${i}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showFeedback && option === currentQuestion.correctAnswer && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {showFeedback && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {currentQuestion.type === "true_false" && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option) => (
                <motion.button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`p-6 text-lg font-medium rounded-lg border transition-all ${
                    showFeedback
                      ? option === currentQuestion.correctAnswer
                        ? "bg-green-100 border-green-500 dark:bg-green-900/30"
                        : selectedAnswer === option
                          ? "bg-red-100 border-red-500 dark:bg-red-900/30"
                          : "opacity-50"
                      : selectedAnswer === option
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                  data-testid={`option-${option.toLowerCase()}`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {currentQuestion.type === "fill_blank" && (
            <div className="space-y-4">
              <Input
                value={fillAnswer}
                onChange={(e) => setFillAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={showFeedback}
                className={showFeedback 
                  ? fillAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                    ? "border-green-500"
                    : "border-red-500"
                  : ""
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && fillAnswer.trim() && !showFeedback) {
                    handleAnswer(fillAnswer);
                  }
                }}
                data-testid="input-fill-blank"
              />
              {!showFeedback && (
                <Button 
                  onClick={() => handleAnswer(fillAnswer)}
                  disabled={!fillAnswer.trim()}
                  className="w-full"
                  data-testid="button-submit-answer"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg ${
                  answers[answers.length - 1]?.isCorrect
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {answers[answers.length - 1]?.isCorrect ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      answers[answers.length - 1]?.isCorrect
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}>
                      {answers[answers.length - 1]?.isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    {!answers[answers.length - 1]?.isCorrect && (
                      <p className="text-sm text-muted-foreground mt-1">
                        The correct answer is: <span className="font-medium">{currentQuestion.correctAnswer}</span>
                      </p>
                    )}
                    {currentQuestion.explanation && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {currentQuestion.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Next button */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            onClick={handleNext} 
            className="w-full"
            data-testid="button-next-question"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
