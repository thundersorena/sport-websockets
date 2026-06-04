"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Match, Commentary } from "@/types/api";
import { matchesService } from "@/services/matches";
import { commentaryService } from "@/services/commentary";
import { Header } from "@/components/header";
import { CommentaryItem } from "@/components/commentary-item";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ArrowLeft, Calendar, Clock, Loader2, Trophy } from "lucide-react";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params.id);

  const [match, setMatch] = useState<Match | null>(null);
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (lastMessage?.type === "commentary" && lastMessage.data.matchId === matchId) {
      setCommentary((prev) => [lastMessage.data, ...prev]);
    } else if (lastMessage?.type === "score_update" && lastMessage.data.id === matchId) {
      setMatch(lastMessage.data);
    }
  }, [lastMessage, matchId]);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const [matchData, commentaryData] = await Promise.all([
        matchesService.getMatch(matchId),
        commentaryService.getCommentary(matchId, 100),
      ]);
      setMatch(matchData);
      setCommentary(commentaryData);
    } catch (error) {
      console.error("Failed to load match data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      weekday: "long",
      month: "long",
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Match not found</p>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to matches
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 md:px-8">
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to matches
          </Button>

          {/* Match Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  <CardTitle>{match.sport.toUpperCase()}</CardTitle>
                </div>
                <Badge variant={getStatusVariant(match.status)}>
                  {match.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="grid grid-cols-3 gap-4 items-center text-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{match.homeTeam}</h2>
                  <div className="text-4xl font-bold text-primary">
                    {match.homeScore}
                  </div>
                </div>

                <div className="text-muted-foreground text-xl font-semibold">
                  VS
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{match.awayTeam}</h2>
                  <div className="text-4xl font-bold text-primary">
                    {match.awayScore}
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(match.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(match.startTime)}</span>
                </div>
                {isConnected && (
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Live updates</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Commentary Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Commentary</h2>
              <Badge variant="outline">
                {commentary.length}{" "}
                {commentary.length === 1 ? "update" : "updates"}
              </Badge>
            </div>

            {commentary.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No commentary available yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {commentary.map((item) => (
                  <CommentaryItem key={item.id} commentary={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
