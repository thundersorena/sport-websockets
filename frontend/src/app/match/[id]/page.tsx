"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { Match, Commentary } from "@/types/api";
import { matchesService } from "@/services/matches";
import { commentaryService } from "@/services/commentary";
import { Header } from "@/components/header";
import { CommentaryItem } from "@/components/commentary-item";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fmtDateLong, fmtTime, statusStyle } from "@/lib/sport-ui";

export default function MatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params.id);

  const [match, setMatch] = useState<Match | null>(null);
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newestId, setNewestId] = useState<number | null>(null);
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  useEffect(() => {
    if (
      lastMessage?.type === "commentary" &&
      lastMessage.data.matchId === matchId
    ) {
      setCommentary((prev) => [lastMessage.data, ...prev]);
      setNewestId(lastMessage.data.id);
    } else if (
      lastMessage?.type === "score_update" &&
      lastMessage.data.id === matchId
    ) {
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

  if (loading) {
    return (
      <div className="sl-app">
        <Header />
        <main
          className="sl-container"
          style={{ display: "flex", justifyContent: "center", padding: "90px 24px" }}
        >
          <Loader2
            className="animate-spin"
            style={{ color: "var(--sl-accent)" }}
            width={32}
            height={32}
          />
        </main>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="sl-app">
        <Header />
        <main
          className="sl-container"
          style={{ textAlign: "center", padding: "90px 24px" }}
        >
          <p
            className="sl-condensed"
            style={{
              fontSize: 24,
              fontWeight: 700,
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}
          >
            Match not found
          </p>
          <button className="sl-submit" style={{ width: "auto", padding: "12px 22px" }} onClick={() => router.push("/")}>
            Back to matches
          </button>
        </main>
      </div>
    );
  }

  const status = statusStyle(match.status);
  const countLabel = `${commentary.length} ${
    commentary.length === 1 ? "update" : "updates"
  }`;

  return (
    <div className="sl-app">
      <Header />
      <main className="sl-container" style={{ maxWidth: 960, padding: "26px 24px 80px" }}>
        <button
          onClick={() => router.push("/")}
          className="sl-navbtn"
          style={{ color: "var(--sl-muted)", padding: "8px 0", marginBottom: 14 }}
        >
          <ArrowLeft width={16} height={16} />
          All matches
        </button>

        {/* scoreboard */}
        <div
          style={{
            position: "relative",
            border: "1px solid var(--sl-border)",
            borderRadius: 20,
            background: "var(--sl-card)",
            boxShadow: "var(--sl-shadow)",
            overflow: "hidden",
            marginBottom: 26,
          }}
        >
          <div style={{ height: 5, background: "var(--sl-grad)" }} />
          <div style={{ padding: "24px 28px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 22,
              }}
            >
              <span
                className="sl-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "2px",
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
                  gap: 7,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "6px 11px",
                  borderRadius: 999,
                  color: status.color,
                  background: status.bg,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: status.color,
                  }}
                />
                {status.label}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: 18,
              }}
            >
              <ScoreSide team={match.homeTeam} score={match.homeScore} />
              <div
                className="sl-condensed"
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  color: "var(--sl-faint)",
                  letterSpacing: "2px",
                }}
              >
                VS
              </div>
              <ScoreSide team={match.awayTeam} score={match.awayScore} />
            </div>

            <div
              className="sl-mono"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid var(--sl-border)",
                color: "var(--sl-muted)",
                fontSize: 13,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Calendar width={14} height={14} />
                {fmtDateLong(match.startTime)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Clock width={14} height={14} />
                {fmtTime(match.startTime)}
              </span>
              {isConnected && (
                <span
                  style={{ display: "flex", alignItems: "center", gap: 7, color: "#22c55e" }}
                >
                  <span
                    style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }}
                  />
                  Live updates
                </span>
              )}
            </div>
          </div>
        </div>

        {/* commentary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            className="sl-condensed"
            style={{
              fontWeight: 800,
              fontSize: 28,
              textTransform: "uppercase",
              letterSpacing: ".3px",
              margin: 0,
            }}
          >
            Live Commentary
          </h2>
          <span
            className="sl-mono"
            style={{
              fontSize: 11,
              color: "var(--sl-muted)",
              border: "1px solid var(--sl-border)",
              padding: "5px 10px",
              borderRadius: 999,
            }}
          >
            {countLabel}
          </span>
        </div>

        {commentary.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px 0",
              color: "var(--sl-muted)",
              border: "1px dashed var(--sl-border)",
              borderRadius: 14,
            }}
          >
            <p style={{ margin: 0, fontSize: 14 }}>
              No commentary yet — updates will appear here live.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {commentary.map((item) => (
              <CommentaryItem
                key={item.id}
                commentary={item}
                isNew={item.id === newestId}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreSide({ team, score }: { team: string; score: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        className="sl-condensed"
        style={{
          fontWeight: 800,
          fontSize: 30,
          lineHeight: 1.05,
          textTransform: "uppercase",
          letterSpacing: ".3px",
        }}
      >
        {team}
      </div>
      {/* key on score so a change re-triggers the pop animation */}
      <div
        key={score}
        className="sl-condensed sl-pop"
        style={{
          fontWeight: 800,
          fontSize: 78,
          lineHeight: 1,
          marginTop: 8,
          background: "var(--sl-grad)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {score}
      </div>
    </div>
  );
}
