"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useWebSocket } from "@/hooks/useWebSocket";

export function Header() {
  const { isConnected } = useWebSocket();
  const dotColor = isConnected ? "#22c55e" : "var(--sl-faint)";

  return (
    <header className="sl-header">
      <div
        className="sl-container"
        style={{
          height: 66,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            cursor: "pointer",
            userSelect: "none",
            textDecoration: "none",
            color: "var(--sl-fg)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--sl-grad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(255,59,59,.4)",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "10px solid #fff",
                marginLeft: 3,
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              className="sl-condensed"
              style={{
                fontWeight: 800,
                fontSize: 21,
                letterSpacing: ".5px",
                textTransform: "uppercase",
              }}
            >
              Sport&nbsp;Live
            </span>
            <span
              className="sl-mono"
              style={{
                fontSize: 9,
                letterSpacing: "2.5px",
                color: "var(--sl-muted)",
                textTransform: "uppercase",
              }}
            >
              Real-time Feed
            </span>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/" className="sl-navbtn">
            Matches
          </Link>
          <Link href="/admin" className="sl-navbtn">
            <Settings width={15} height={15} />
            Admin
          </Link>

          <div
            style={{
              width: 1,
              height: 22,
              background: "var(--sl-border)",
              margin: "0 6px",
            }}
          />

          <div
            title={isConnected ? "Connected — live updates on" : "Reconnecting…"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              border: "1px solid var(--sl-border)",
              borderRadius: 999,
              background: "var(--sl-card)",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dotColor,
              }}
            >
              {isConnected && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "sl-pulse 1.8s ease-out infinite",
                  }}
                />
              )}
            </span>
            <span
              className="sl-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: ".5px",
                color: "var(--sl-muted)",
              }}
            >
              {isConnected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
