"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { matchesService } from "@/services/matches";
import { SlToast } from "@/components/ui/sl-toast";
import { Field, FieldError, FormHead, toLocalInput } from "./form-parts";

const SPORTS = ["Soccer", "Basketball", "Hockey", "Tennis"];

function defaultKickoff() {
  const d = new Date(Date.now() + 3600000);
  d.setSeconds(0, 0);
  return toLocalInput(d);
}

export function CreateMatchForm() {
  const [sport, setSport] = useState(SPORTS[0]);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [kickoff, setKickoff] = useState(defaultKickoff());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError("Home and away team names are required.");
      return;
    }
    const start = kickoff ? new Date(kickoff) : new Date(Date.now() + 3600000);
    if (Number.isNaN(start.getTime())) {
      setError("Please choose a valid kickoff time.");
      return;
    }
    // Backend requires an endTime after startTime; derive a 2h window.
    const end = new Date(start.getTime() + 2 * 3600000);

    setLoading(true);
    try {
      await matchesService.createMatch({
        sport,
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setToast("Match created & broadcast");
      setHomeTeam("");
      setAwayTeam("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create match. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormHead
        title="Create New Match"
        desc="It appears on the home feed in real time."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Sport">
          <select
            className="sl-select"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
          >
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Kickoff">
          <input
            className="sl-input"
            type="datetime-local"
            value={kickoff}
            onChange={(e) => setKickoff(e.target.value)}
          />
        </Field>

        <Field label="Home Team">
          <input
            className="sl-input"
            placeholder="e.g. Riverside FC"
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
          />
        </Field>

        <Field label="Away Team">
          <input
            className="sl-input"
            placeholder="e.g. Kingsport Utd"
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
          />
        </Field>
      </div>

      <FieldError message={error} />

      <button
        type="submit"
        className="sl-submit"
        style={{ marginTop: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        disabled={loading}
      >
        {loading && <Loader2 className="animate-spin" width={16} height={16} />}
        {loading ? "Creating…" : "Create & Broadcast"}
      </button>

      <SlToast message={toast} onClose={() => setToast(null)} />
    </form>
  );
}
