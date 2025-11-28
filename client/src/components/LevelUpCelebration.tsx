import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LevelBadge } from "./LevelBadge";
import { Sparkles, Trophy, Star } from "lucide-react";

interface LevelUpCelebrationProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpCelebration({ isOpen, newLevel, onClose }: LevelUpCelebrationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="level-up-celebration"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative bg-card rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][i % 6],
                    left: `${Math.random() * 100}%`,
                    top: "-10%",
                  }}
                  animate={{
                    y: ["0%", "1200%"],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, Math.random() * 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className="relative"
            >
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 3,
                  repeatDelay: 0.5,
                }}
              >
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </motion.div>
              
              <motion.div
                className="absolute -top-2 -left-2"
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 3,
                  repeatDelay: 0.5,
                  delay: 0.25,
                }}
              >
                <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              Level Up!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground mb-4"
            >
              You've reached a new level!
            </motion.p>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", damping: 10 }}
              className="flex justify-center mb-6"
            >
              <LevelBadge level={newLevel} size="lg" />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-muted-foreground mb-6"
            >
              Keep studying to unlock more achievements!
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button onClick={onClose} className="w-full" data-testid="button-continue-learning">
                Continue Learning
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
