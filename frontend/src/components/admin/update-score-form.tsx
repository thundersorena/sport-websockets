"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { matchesService } from "@/services/matches";
import { Match } from "@/types/api";
import { SlToast } from "@/components/ui/sl-toast";
import { Field, FieldError, FormHead } from "./form-parts";

export function UpdateScoreForm() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchId, setMatchId] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
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

  const handleSelect = (id: string) => {
    setMatchId(id);
    const match = matches.find((m) => m.id.toString() === id);
    if (match) {
      setHomeScore(match.homeScore);
      setAwayScore(match.awayScore);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!matchId) {
      setError("Please select a match.");
      return;
    }
    setLoading(true);
    try {
      await matchesService.updateScore(parseInt(matchId, 10), {
        homeScore: Math.max(0, homeScore),
        awayScore: Math.max(0, awayScore),
      });
      setToast("Score pushed live");
      await loadMatches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update score. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selected = matches.find((m) => m.id.toString() === matchId);

  return (
    <form onSubmit={handleSubmit}>
      <FormHead title="Update Score" desc="Scores roll live on every screen." />

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
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value="" disabled>
              Choose a match to update
            </option>
            {matches.map((m) => (
              <option key={m.id} value={m.id.toString()}>
                {m.homeTeam} vs {m.awayTeam} ({m.status})
              </option>
            ))}
          </select>
        )}
      </Field>

      {selected && (
        <div
          className="sl-mono"
          style={{
            fontSize: 13,
            color: "var(--sl-muted)",
            background: "var(--sl-bg2)",
            border: "1px solid var(--sl-border)",
            borderRadius: 9,
            padding: "10px 12px",
            marginBottom: 14,
          }}
        >
          Current: {selected.homeTeam} {selected.homeScore} – {selected.awayScore}{" "}
          {selected.awayTeam}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Home Score">
          <input
            className="sl-input sl-condensed"
            style={{ fontWeight: 700, fontSize: 20 }}
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(parseInt(e.target.value, 10) || 0)}
          />
        </Field>
        <Field label="Away Score">
          <input
            className="sl-input sl-condensed"
            style={{ fontWeight: 700, fontSize: 20 }}
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(parseInt(e.target.value, 10) || 0)}
          />
        </Field>
      </div>

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
        {loading ? "Pushing…" : "Push Score Update"}
      </button>

      <SlToast message={toast} onClose={() => setToast(null)} />
    </form>
  );
}
