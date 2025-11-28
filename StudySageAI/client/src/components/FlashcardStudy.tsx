import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { XPGainAnimation } from "./XPGainAnimation";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  X, 
  BookOpen,
  Layers
} from "lucide-react";
import type { Flashcard, FlashcardSet } from "@shared/schema";
import { XP_PER_FLASHCARD } from "@shared/schema";

interface FlashcardStudyProps {
  flashcardSet: FlashcardSet & { flashcards: Flashcard[] };
  onComplete: () => void;
  onBack: () => void;
}

export function FlashcardStudy({ flashcardSet, onComplete, onBack }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyPile, setStudyPile] = useState<Flashcard[]>([]);
  const [knownPile, setKnownPile] = useState<Flashcard[]>([]);
  const [showXP, setShowXP] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cards = flashcardSet.flashcards;
  const currentCard = studyPile[currentIndex] || cards[currentIndex];
  const totalCards = cards.length;
  const studiedCount = knownPile.length;

  useEffect(() => {
    setStudyPile([...cards]);
  }, [cards]);

  const completeMutation = useMutation({
    mutationFn: async (data: { cardsStudied: number; correctAnswers: number }) => {
      return apiRequest("POST", `/api/flashcard-sets/${flashcardSet.id}/complete`, data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      toast({
        title: "Study session complete!",
        description: `You earned ${data.xpEarned} XP!`,
      });
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    const card = studyPile[currentIndex];
    setKnownPile([...knownPile, card]);
    setEarnedXP((prev) => prev + XP_PER_FLASHCARD);
    setShowXP(true);

    const newStudyPile = studyPile.filter((_, i) => i !== currentIndex);
    
    if (newStudyPile.length === 0) {
      // All cards studied
      completeMutation.mutate({
        cardsStudied: totalCards,
        correctAnswers: knownPile.length + 1,
      });
      onComplete();
    } else {
      setStudyPile(newStudyPile);
      if (currentIndex >= newStudyPile.length) {
        setCurrentIndex(0);
      }
      setIsFlipped(false);
    }
  };

  const handleStudyAgain = () => {
    // Move card to end of study pile
    const card = studyPile[currentIndex];
    const newStudyPile = [...studyPile.filter((_, i) => i !== currentIndex), card];
    setStudyPile(newStudyPile);
    
    if (currentIndex >= newStudyPile.length - 1) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < studyPile.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const progress = ((totalCards - studyPile.length) / totalCards) * 100;

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-xl font-medium mb-2">No flashcards available</p>
        <Button onClick={onBack} data-testid="button-back-to-sets">
          Back to Sets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="flashcard-study">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} data-testid="button-back">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="font-semibold">{flashcardSet.title}</h2>
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {studyPile.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{studiedCount}/{totalCards}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </div>

      {/* Flashcard */}
      <div className="relative perspective-1000">
        <XPGainAnimation
          amount={XP_PER_FLASHCARD}
          isVisible={showXP}
          onComplete={() => setShowXP(false)}
        />
        
        <motion.div
          className="relative w-full min-h-96 cursor-pointer"
          onClick={handleFlip}
          data-testid="flashcard"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? "back" : "front"}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className={`min-h-96 flex flex-col ${isFlipped ? "bg-primary/5" : ""}`}>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
                    {isFlipped ? "Answer" : "Question"}
                  </p>
                  <p className="text-2xl font-medium leading-relaxed">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  {isFlipped && currentCard.explanation && (
                    <div className="mt-6 pt-6 border-t w-full">
                      <p className="text-sm text-muted-foreground">
                        {currentCard.explanation}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    Tap to {isFlipped ? "see question" : "reveal answer"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleStudyAgain}
            className="flex items-center gap-2"
            data-testid="button-study-again"
          >
            <RotateCcw className="h-4 w-4" />
            Study Again
          </Button>
          <Button
            onClick={handleKnown}
            className="flex items-center gap-2"
            data-testid="button-known"
          >
            <Check className="h-4 w-4" />
            Got It!
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex >= studyPile.length - 1}
          data-testid="button-next"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {studyPile.slice(0, 20).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-primary"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
        {studyPile.length > 20 && (
          <span className="text-xs text-muted-foreground ml-1">
            +{studyPile.length - 20} more
          </span>
        )}
      </div>
    </div>
  );
}
