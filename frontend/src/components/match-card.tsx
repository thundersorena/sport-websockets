import { Match } from "@/types/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const getStatusVariant = (status: Match["status"]) => {
    switch (status) {
      case "live":
        return "destructive";
      case "finished":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {match.sport.toUpperCase()}
            </CardTitle>
            <Badge variant={getStatusVariant(match.status)}>
              {match.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{match.homeTeam}</span>
              <span className="text-2xl font-bold">{match.homeScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{match.awayTeam}</span>
              <span className="text-2xl font-bold">{match.awayScore}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(match.startTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(match.startTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
