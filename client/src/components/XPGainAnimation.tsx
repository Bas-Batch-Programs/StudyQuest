import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XPGainAnimationProps {
  amount: number;
  isVisible: boolean;
  onComplete?: () => void;
}

export function XPGainAnimation({ amount, isVisible, onComplete }: XPGainAnimationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 0.8 }}
          animate={{ y: -60, opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          data-testid="xp-gain-animation"
        >
          <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full font-bold text-lg shadow-lg">
            <Zap className="h-5 w-5" />
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
