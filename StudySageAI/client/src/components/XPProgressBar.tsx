import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { xpForNextLevel } from "@shared/schema";
import { Zap } from "lucide-react";

interface XPProgressBarProps {
  totalXp: number;
  level: number;
  compact?: boolean;
}

export function XPProgressBar({ totalXp, level, compact = false }: XPProgressBarProps) {
  const { current, needed, progress } = xpForNextLevel(totalXp);

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer" data-testid="xp-progress-compact">
            <Zap className="h-4 w-4 text-primary" />
            <div className="w-20">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{current} / {needed} XP to Level {level + 1}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-2" data-testid="xp-progress-full">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          <Zap className="h-4 w-4 text-primary" />
          Level {level}
        </span>
        <span className="text-muted-foreground">{current} / {needed} XP</span>
      </div>
      <Progress value={progress} className="h-3" />
      <p className="text-xs text-muted-foreground text-center">
        {needed - current} XP to Level {level + 1}
      </p>
    </div>
  );
}
