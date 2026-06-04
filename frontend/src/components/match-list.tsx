"use client";

import { useEffect, useState } from "react";
import { Match } from "@/types/api";
import { matchesService } from "@/services/matches";
import { MatchCard } from "@/components/match-card";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "live" | "scheduled" | "finished">("all");
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (lastMessage?.type === "match_created") {
      setMatches((prev) => [lastMessage.data, ...prev]);
    } else if (lastMessage?.type === "score_update") {
      setMatches((prev) =>
        prev.map((m) => (m.id === lastMessage.data.id ? lastMessage.data : m))
      );
    }
  }, [lastMessage]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchesService.getMatches(50);
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) =>
    filter === "all" ? true : match.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Matches</h1>
          <p className="text-muted-foreground">
            {isConnected && (
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Live updates enabled
              </span>
            )}
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-100">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
