"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Match, MatchStatus } from "@/types/api";
import { matchesService } from "@/services/matches";
import { MatchCard } from "@/components/match-card";
import { useWebSocket } from "@/hooks/useWebSocket";

type Filter = "all" | MatchStatus;

const FILTERS: Filter[] = ["all", "live", "scheduled", "finished"];

export function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const { lastMessage } = useWebSocket();

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

  const liveCount = useMemo(
    () => matches.filter((m) => m.status === "live").length,
    [matches]
  );
  const filteredMatches = matches.filter((m) =>
    filter === "all" ? true : m.status === filter
  );

  const countFor = (f: Filter) =>
    f === "all" ? matches.length : matches.filter((m) => m.status === f).length;

  return (
    <main className="sl-container" style={{ padding: "38px 24px 80px" }}>
      {/* hero */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 26,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "var(--sl-live)",
                boxShadow:
                  "0 0 0 4px color-mix(in srgb,var(--sl-live) 22%,transparent)",
              }}
            />
            <span
              className="sl-mono"
              style={{
                fontSize: 11,
                letterSpacing: "2px",
                color: "var(--sl-live)",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Live Now
            </span>
          </div>
          <h1
            className="sl-condensed"
            style={{
              fontWeight: 800,
              fontSize: 52,
              lineHeight: 0.95,
              letterSpacing: "-.5px",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            Today&apos;s Matches
          </h1>
          <p style={{ color: "var(--sl-muted)", margin: "8px 0 0", fontSize: 15 }}>
            Scores &amp; commentary update in real time — no refresh needed.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <StatCard value={liveCount} label="Live" color="var(--sl-live)" />
          <StatCard value={matches.length} label="Total" />
        </div>
      </div>

      {/* filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 26,
          borderBottom: "1px solid var(--sl-border)",
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              className="sl-tab"
              onClick={() => setFilter(f)}
              style={{ color: active ? "var(--sl-fg)" : "var(--sl-muted)" }}
            >
              <span>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </span>
              <span
                className="sl-mono"
                style={{
                  marginLeft: 7,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--sl-faint)",
                }}
              >
                {countFor(f)}
              </span>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: -1,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  background: active ? "var(--sl-grad)" : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px 0",
          }}
        >
          <Loader2
            className="animate-spin"
            style={{ color: "var(--sl-accent)" }}
            width={32}
            height={32}
          />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 0",
            color: "var(--sl-muted)",
          }}
        >
          <p
            className="sl-condensed"
            style={{
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            No matches here
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>Try a different filter.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
            gap: 16,
          }}
        >
          {filteredMatches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function StatCard({
  value,
  label,
  color = "var(--sl-fg)",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "12px 20px",
        border: "1px solid var(--sl-border)",
        borderRadius: 14,
        background: "var(--sl-card)",
      }}
    >
      <div
        className="sl-condensed"
        style={{ fontWeight: 800, fontSize: 34, lineHeight: 1, color }}
      >
        {value}
      </div>
      <div
        className="sl-mono"
        style={{
          fontSize: 9.5,
          letterSpacing: "1.5px",
          color: "var(--sl-muted)",
          textTransform: "uppercase",
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  );
}
