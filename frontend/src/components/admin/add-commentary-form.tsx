"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { matchesService } from "@/services/matches";
import { commentaryService } from "@/services/commentary";
import { Match } from "@/types/api";
import { SlToast } from "@/components/ui/sl-toast";
import { Field, FieldError, FormHead } from "./form-parts";

const EVENTS = [
  { value: "goal", label: "Goal" },
  { value: "yellow-card", label: "Yellow Card" },
  { value: "red-card", label: "Red Card" },
  { value: "substitution", label: "Substitution" },
  { value: "corner", label: "Corner" },
  { value: "penalty", label: "Penalty" },
];
const PERIODS = ["1H", "2H", "HT", "ET"];

export function AddCommentaryForm() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchId, setMatchId] = useState("");
  const [minute, setMinute] = useState(1);
  const [eventType, setEventType] = useState(EVENTS[0].value);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [team, setTeam] = useState("");
  const [message, setMessage] = useState("");
  const [sequence, setSequence] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchesService.getMatches();
      setMatches(data);
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!matchId) {
      setError("Please select a match.");
      return;
    }
    if (!message.trim()) {
      setError("Please describe the moment.");
      return;
    }
    setLoading(true);
    try {
      await commentaryService.createCommentary(parseInt(matchId, 10), {
        minute: Math.max(0, minute),
        sequence,
        period,
        eventType,
        message: message.trim(),
        team: team.trim() || undefined,
      });
      setToast("Commentary broadcast");
      setMessage("");
      setSequence((s) => s + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add commentary. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormHead
        title="Add Commentary"
        desc="Appears at the top of the live feed instantly."
      />

      <Field label="Match" style={{ marginBottom: 14 }}>
        {loadingMatches ? (
          <div style={{ display: "flex", padding: "8px 0" }}>
            <Loader2
              className="animate-spin"
              style={{ color: "var(--sl-muted)" }}
              width={20}
              height={20}
            />
          </div>
        ) : (
          <select
            className="sl-select"
            value={matchId}
            onChange={(e) => {
              setMatchId(e.target.value);
              setSequence(0);
            }}
          >
            <option value="" disabled>
              Choose a match
            </option>
            {matches.map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.homeTeam} vs {m.awayTeam} ({m.status})
              </option>
            ))}
          </select>
        )}
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <Field label="Minute">
          <input
            className="sl-input"
            type="number"
            min={0}
            value={minute}
            onChange={(e) => setMinute(parseInt(e.target.value, 10) || 0)}
          />
        </Field>
        <Field label="Event">
          <select
            className="sl-select"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {EVENTS.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Period">
          <select
            className="sl-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Team" style={{ marginBottom: 14 }}>
        <input
          className="sl-input"
          placeholder="Team name"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
      </Field>

      <Field label="Message">
        <textarea
          className="sl-textarea"
          rows={3}
          placeholder="Describe the moment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Field>

      <FieldError message={error} />

      <button
        type="submit"
        className="sl-submit"
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
        disabled={loading || !matchId}
      >
        {loading && <Loader2 className="animate-spin" width={16} height={16} />}
        {loading ? "Broadcasting…" : "Broadcast Commentary"}
      </button>

      <SlToast message={toast} onClose={() => setToast(null)} />
    </form>
  );
}
