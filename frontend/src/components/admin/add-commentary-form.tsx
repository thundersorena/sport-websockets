"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { matchesService } from "@/services/matches";
import { commentaryService } from "@/services/commentary";
import { Match } from "@/types/api";
import { Loader2 } from "lucide-react";

export function AddCommentaryForm() {
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    matchId: "",
    minute: 0,
    sequence: 0,
    period: "1st Half",
    eventType: "general",
    message: "",
    actor: "",
    team: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.matchId || !formData.message.trim()) {
      setMessage({
        type: "error",
        text: "Please select a match and enter commentary message",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const commentary = await commentaryService.createCommentary(
        parseInt(formData.matchId),
        {
          minute: formData.minute,
          sequence: formData.sequence,
          period: formData.period,
          eventType: formData.eventType,
          message: formData.message.trim(),
          actor: formData.actor || undefined,
          team: formData.team || undefined,
        },
      );

      setMessage({
        type: "success",
        text: "Commentary added successfully! Check the match detail page.",
      });
      // Clear only the message, increment sequence
      setFormData({
        ...formData,
        message: "",
        sequence: formData.sequence + 1,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to add commentary. Please try again.",
      });
      console.error("Add commentary error:", error);
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
          <Select
            value={formData.matchId}
            onValueChange={(value) =>
              setFormData({ ...formData, matchId: value })
            }
          >
            <SelectTrigger id="matchId">
              <SelectValue placeholder="Choose a match" />
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
        <div className="p-4 rounded-md bg-muted">
          <div className="text-sm font-medium mb-1">Match Details:</div>
          <div className="text-lg font-bold mb-1">
            {selectedMatch.homeTeam} {selectedMatch.homeScore} -{" "}
            {selectedMatch.awayScore} {selectedMatch.awayTeam}
          </div>
          <div className="text-sm text-muted-foreground">
            Status: {selectedMatch.status}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minute">Minute</Label>
          <Input
            id="minute"
            type="number"
            min="0"
            value={formData.minute}
            onChange={(e) =>
              setFormData({
                ...formData,
                minute: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sequence">Sequence</Label>
          <Input
            id="sequence"
            type="number"
            min="0"
            value={formData.sequence}
            onChange={(e) =>
              setFormData({
                ...formData,
                sequence: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select
            value={formData.period}
            onValueChange={(value) =>
              setFormData({ ...formData, period: value })
            }
          >
            <SelectTrigger id="period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st Half">1st Half</SelectItem>
              <SelectItem value="2nd Half">2nd Half</SelectItem>
              <SelectItem value="Extra Time">Extra Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Select
            value={formData.eventType}
            onValueChange={(value) =>
              setFormData({ ...formData, eventType: value })
            }
          >
            <SelectTrigger id="eventType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="substitution">Substitution</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="actor">Actor (optional)</Label>
          <Input
            id="actor"
            placeholder="e.g., Player name"
            value={formData.actor}
            onChange={(e) =>
              setFormData({ ...formData, actor: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="team">Team (optional)</Label>
          <Input
            id="team"
            placeholder="e.g., Home or Away"
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Commentary Message *</Label>
        <Textarea
          id="message"
          placeholder="e.g., Goal! Amazing strike from the edge of the box!"
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          required
        />
        <p className="text-xs text-muted-foreground">
          Enter live commentary for the match. It will appear instantly on the
          match detail page.
        </p>
      </div>

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
            Adding...
          </>
        ) : (
          "Add Commentary"
        )}
      </Button>
    </form>
  );
}
