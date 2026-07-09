import { Commentary } from "@/types/api";
import { eventStyle } from "@/lib/sport-ui";

interface CommentaryItemProps {
  commentary: Commentary;
  /** true for the newest item, which gets a subtle entrance animation */
  isNew?: boolean;
}

export function CommentaryItem({ commentary, isNew = false }: CommentaryItemProps) {
  const ev = eventStyle(commentary.eventType);

  return (
    <div
      className={isNew ? "sl-fadeup" : undefined}
      style={{
        display: "flex",
        gap: 14,
        background: "var(--sl-card)",
        border: "1px solid var(--sl-border)",
        borderRadius: 14,
        padding: "15px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: ev.color,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 46,
        }}
      >
        <span
          className="sl-condensed"
          style={{ fontWeight: 800, fontSize: 26, lineHeight: 1, color: ev.color }}
        >
          {commentary.minute}&apos;
        </span>
        {commentary.period && (
          <span
            className="sl-mono"
            style={{
              fontSize: 8.5,
              letterSpacing: "1px",
              color: "var(--sl-faint)",
              textTransform: "uppercase",
              marginTop: 3,
            }}
          >
            {commentary.period}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 6,
          }}
        >
          <span
            className="sl-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: ev.color,
              background: ev.bg,
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: 2, background: ev.color }}
            />
            {ev.label}
          </span>
          {commentary.team && (
            <span
              className="sl-condensed"
              style={{ fontWeight: 700, fontSize: 16, letterSpacing: ".3px" }}
            >
              {commentary.team}
            </span>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45, color: "var(--sl-fg)" }}>
          {commentary.message}
        </p>

        {commentary.actor && (
          <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--sl-muted)" }}>
            Player: {commentary.actor}
          </p>
        )}

        {commentary.tags && commentary.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {commentary.tags.map((tag, i) => (
              <span
                key={i}
                className="sl-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".5px",
                  textTransform: "uppercase",
                  color: "var(--sl-muted)",
                  background: "var(--sl-chip)",
                  border: "1px solid var(--sl-border)",
                  padding: "3px 7px",
                  borderRadius: 999,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
