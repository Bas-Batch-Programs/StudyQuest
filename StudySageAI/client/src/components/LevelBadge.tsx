import { cn } from "@/lib/utils";
import { Award } from "lucide-react";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const levelColors: Record<number, string> = {
  1: "from-gray-400 to-gray-500",
  2: "from-green-400 to-green-600",
  3: "from-blue-400 to-blue-600",
  4: "from-purple-400 to-purple-600",
  5: "from-orange-400 to-orange-600",
  6: "from-pink-400 to-pink-600",
  7: "from-yellow-400 to-yellow-600",
  8: "from-red-400 to-red-600",
  9: "from-indigo-400 to-indigo-600",
  10: "from-emerald-400 to-emerald-600",
};

export function LevelBadge({ level, size = "md", showIcon = true }: LevelBadgeProps) {
  const colorClass = levelColors[Math.min(level, 10)] || levelColors[10];
  
  const sizeClasses = {
    sm: "h-6 min-w-6 text-xs px-1.5",
    md: "h-8 min-w-8 text-sm px-2",
    lg: "h-10 min-w-10 text-base px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r text-white font-bold shadow-sm",
        colorClass,
        sizeClasses[size]
      )}
      data-testid={`level-badge-${level}`}
    >
      {showIcon && <Award className={iconSizes[size]} />}
      <span>{level}</span>
    </div>
  );
}
