import { Flame, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  compact?: boolean;
}

export function StreakDisplay({ currentStreak, longestStreak, lastStudyDate, compact = false }: StreakDisplayProps) {
  const today = new Date();
  const studiedToday = lastStudyDate 
    ? new Date(lastStudyDate).toDateString() === today.toDateString()
    : false;

  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex items-center gap-1.5 cursor-pointer" 
            data-testid="streak-display-compact"
          >
            <Flame className={`h-5 w-5 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className="font-semibold text-sm">{currentStreak}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{currentStreak} day streak! Best: {longestStreak} days</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Card data-testid="streak-display-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${currentStreak > 0 ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted"}`}>
              <Flame className={`h-6 w-6 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          {last7Days.map((date, i) => {
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
            const isToday = date.toDateString() === today.toDateString();
            const daysSinceStudy = lastStudyDate 
              ? Math.floor((today.getTime() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24))
              : Infinity;
            const wasActiveDay = i >= (6 - Math.min(currentStreak - (studiedToday ? 0 : 1), 6)) && 
                                 (i < 6 || studiedToday);
            
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${wasActiveDay && currentStreak > 0
                      ? "bg-orange-500 text-white" 
                      : isToday 
                        ? "border-2 border-dashed border-muted-foreground/50 text-muted-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {wasActiveDay && currentStreak > 0 ? (
                    <Flame className="h-4 w-4" />
                  ) : (
                    dayName
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentStreak > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {studiedToday 
              ? "Great job! Keep it going tomorrow!" 
              : "Study today to keep your streak alive!"}
          </p>
        )}
        {currentStreak === 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Start studying to begin a new streak!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
