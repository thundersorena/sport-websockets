import { Commentary } from "@/types/api";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface CommentaryItemProps {
  commentary: Commentary;
}

export function CommentaryItem({ commentary }: CommentaryItemProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "goal":
        return "⚽";
      case "yellow-card":
        return "🟨";
      case "red-card":
        return "🟥";
      case "substitution":
        return "🔄";
      case "corner":
        return "🚩";
      case "penalty":
        return "🎯";
      default:
        return "📝";
    }
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center min-w-15">
            <span className="text-2xl font-bold text-primary">
              {commentary.minute}'
            </span>
            <span className="text-xs text-muted-foreground">
              {commentary.period}
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{getEventIcon(commentary.eventType)}</span>
              <Badge variant="outline">{commentary.eventType}</Badge>
              {commentary.team && (
                <span className="font-semibold">{commentary.team}</span>
              )}
            </div>

            <p className="text-sm">{commentary.message}</p>

            {commentary.actor && (
              <p className="text-sm text-muted-foreground">
                Player: {commentary.actor}
              </p>
            )}

            {commentary.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {commentary.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
