import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Match } from "@/types/api";
import { accentBar, fmtDate, fmtTime, statusStyle } from "@/lib/sport-ui";

interface MatchCardProps {
  match: Match;
  /** stagger index for the fade-up entrance animation */
  index?: number;
}

export function MatchCard({ match, index = 0 }: MatchCardProps) {
  const status = statusStyle(match.status);
  const homeWin = match.homeScore > match.awayScore;
  const awayWin = match.awayScore > match.homeScore;

  return (
    <Link
      href={`/match/${match.id}`}
      className="sl-card-el sl-fadeup"
      style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: accentBar(match.status),
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          className="sl-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: "1.5px",
            color: "var(--sl-muted)",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {match.sport.toUpperCase()}
        </span>
        <span
          className="sl-mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "5px 9px",
            borderRadius: 999,
            color: status.color,
            background: status.bg,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: status.color,
            }}
          />
          {status.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <TeamRow name={match.homeTeam} score={match.homeScore} lead={homeWin} />
        <TeamRow name={match.awayTeam} score={match.awayScore} lead={awayWin} />
      </div>

      <div
        className="sl-mono"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--sl-border)",
          color: "var(--sl-muted)",
          fontSize: 12.5,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar width={13} height={13} />
          {fmtDate(match.startTime)}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Clock width={13} height={13} />
          {fmtTime(match.startTime)}
        </span>
        <span
          style={{ marginLeft: "auto", color: "var(--sl-accent)", fontWeight: 700 }}
        >
          View →
        </span>
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  score,
  lead,
}: {
  name: string;
  score: number;
  lead: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span
        className="sl-condensed"
        style={{ fontWeight: 700, fontSize: 23, letterSpacing: ".3px" }}
      >
        {name}
      </span>
      <span
        className="sl-condensed"
        style={{
          fontWeight: 800,
          fontSize: 30,
          minWidth: 34,
          textAlign: "right",
          color: lead ? "var(--sl-fg)" : "var(--sl-muted)",
        }}
      >
        {score}
      </span>
    </div>
  );
}
