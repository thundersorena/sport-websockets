"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchesService } from "@/services/matches";
import { Match, MatchStatus } from "@/types/api";
import { Loader2 } from "lucide-react";

export function UpdateScoreForm() {
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    matchId: "",
    homeScore: 0,
    awayScore: 0,
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchesService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleMatchSelect = (matchId: string) => {
    const match = matches.find((m) => m.id.toString() === matchId);
    if (match) {
      setFormData({
        matchId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matchId) {
      setMessage({ type: "error", text: "Please select a match" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const match = await matchesService.updateScore(
        parseInt(formData.matchId),
        {
          homeScore: formData.homeScore,
          awayScore: formData.awayScore,
        },
      );

      setMessage({
        type: "success",
        text: "Score updated successfully! Check the match page.",
      });
      // Reload matches to get updated data
      await loadMatches();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update score. Please try again.",
      });
      console.error("Update score error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedMatch = matches.find(
    (m) => m.id.toString() === formData.matchId,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="matchId">Select Match *</Label>
        {loadingMatches ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Select value={formData.matchId} onValueChange={handleMatchSelect}>
            <SelectTrigger id="matchId">
              <SelectValue placeholder="Choose a match to update" />
            </SelectTrigger>
            <SelectContent>
              {matches.map((match) => (
                <SelectItem key={match.id} value={match.id.toString()}>
                  {match.homeTeam} vs {match.awayTeam} ({match.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedMatch && (
        <>
          <div className="p-4 rounded-md bg-muted">
            <div className="text-sm font-medium mb-2">Current Score:</div>
            <div className="text-lg">
              {selectedMatch.homeTeam} {selectedMatch.homeScore} -{" "}
              {selectedMatch.awayScore} {selectedMatch.awayTeam}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeScore">{selectedMatch.homeTeam} Score</Label>
              <Input
                id="homeScore"
                type="number"
                min="0"
                value={formData.homeScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    homeScore: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="awayScore">{selectedMatch.awayTeam} Score</Label>
              <Input
                id="awayScore"
                type="number"
                min="0"
                value={formData.awayScore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    awayScore: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        </>
      )}

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !formData.matchId}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Score"
        )}
      </Button>
    </form>
  );
}
