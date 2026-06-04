"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesService } from "@/services/matches";
import { Loader2 } from "lucide-react";

export function CreateMatchForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Get current date for default times
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(20, 0, 0, 0);

  const [formData, setFormData] = useState({
    sport: "Football",
    homeTeam: "",
    awayTeam: "",
    startTime: tomorrow.toISOString(),
    endTime: tomorrowEnd.toISOString(),
    homeScore: 0,
    awayScore: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Client-side validation
    if (!formData.sport.trim()) {
      setMessage({ type: "error", text: "Sport name is required" });
      setLoading(false);
      return;
    }

    if (!formData.homeTeam.trim()) {
      setMessage({ type: "error", text: "Home team name is required" });
      setLoading(false);
      return;
    }

    if (!formData.awayTeam.trim()) {
      setMessage({ type: "error", text: "Away team name is required" });
      setLoading(false);
      return;
    }

    // Check if end time is after start time
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) {
      setMessage({ type: "error", text: "End time must be after start time" });
      setLoading(false);
      return;
    }

    // Validate form data before sending
    console.log("Submitting match data:", formData);

    try {
      const match = await matchesService.createMatch(formData);

      setMessage({
        type: "success",
        text: "Match created successfully! Check the home page.",
      });
      // Reset form
      const resetTomorrow = new Date();
      resetTomorrow.setDate(resetTomorrow.getDate() + 1);
      resetTomorrow.setHours(18, 0, 0, 0);
      const resetTomorrowEnd = new Date(resetTomorrow);
      resetTomorrowEnd.setHours(20, 0, 0, 0);

      setFormData({
        sport: "Football",
        homeTeam: "",
        awayTeam: "",
        startTime: resetTomorrow.toISOString(),
        endTime: resetTomorrowEnd.toISOString(),
        homeScore: 0,
        awayScore: 0,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to create match. Please try again.";
      setMessage({ type: "error", text: errorMessage });
      console.error("Create match error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sport">Sport *</Label>
        <Input
          id="sport"
          placeholder="e.g., Football"
          value={formData.sport}
          onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="homeTeam">Home Team *</Label>
          <Input
            id="homeTeam"
            placeholder="e.g., Manchester United"
            value={formData.homeTeam}
            onChange={(e) =>
              setFormData({ ...formData, homeTeam: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="awayTeam">Away Team *</Label>
          <Input
            id="awayTeam"
            placeholder="e.g., Liverpool"
            value={formData.awayTeam}
            onChange={(e) =>
              setFormData({ ...formData, awayTeam: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={
              formData.startTime
                ? new Date(formData.startTime).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => {
              if (e.target.value) {
                // Parse the datetime-local value and convert to ISO string
                const localDate = new Date(e.target.value);
                if (!isNaN(localDate.getTime())) {
                  setFormData({
                    ...formData,
                    startTime: localDate.toISOString(),
                  });
                }
              }
            }}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.startTime &&
              `Selected: ${new Date(formData.startTime).toLocaleString()}`}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={
              formData.endTime
                ? new Date(formData.endTime).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => {
              if (e.target.value) {
                // Parse the datetime-local value and convert to ISO string
                const localDate = new Date(e.target.value);
                if (!isNaN(localDate.getTime())) {
                  setFormData({
                    ...formData,
                    endTime: localDate.toISOString(),
                  });
                }
              }
            }}
            required
          />
          <p className="text-xs text-muted-foreground">
            {formData.endTime &&
              `Selected: ${new Date(formData.endTime).toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="homeScore">Home Score (optional)</Label>
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
          <Label htmlFor="awayScore">Away Score (optional)</Label>
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

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Match"
        )}
      </Button>
    </form>
  );
}
