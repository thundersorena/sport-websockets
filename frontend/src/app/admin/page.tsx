"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { CreateMatchForm } from "@/components/admin/create-match-form";
import { UpdateScoreForm } from "@/components/admin/update-score-form";
import { AddCommentaryForm } from "@/components/admin/add-commentary-form";

type AdminTab = "create" | "score" | "commentary";

const TABS: { key: AdminTab; label: string }[] = [
  { key: "create", label: "Create Match" },
  { key: "score", label: "Update Score" },
  { key: "commentary", label: "Commentary" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("create");

  return (
    <div className="sl-app">
      <Header />
      <main className="sl-container" style={{ maxWidth: 760, padding: "34px 24px 80px" }}>
        <h1
          className="sl-condensed"
          style={{
            fontWeight: 800,
            fontSize: 44,
            textTransform: "uppercase",
            letterSpacing: "-.3px",
            margin: "0 0 4px",
          }}
        >
          Admin Console
        </h1>
        <p style={{ color: "var(--sl-muted)", margin: "0 0 26px", fontSize: 15 }}>
          Create matches, push scores, and broadcast commentary — every change
          streams to viewers instantly.
        </p>

        {/* segmented control */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--sl-card)",
            border: "1px solid var(--sl-border)",
            borderRadius: 12,
            padding: 5,
            marginBottom: 22,
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="sl-condensed"
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: ".5px",
                  textTransform: "uppercase",
                  padding: 10,
                  borderRadius: 8,
                  transition: "all .2s",
                  color: active ? "#fff" : "var(--sl-muted)",
                  background: active ? "var(--sl-grad)" : "transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            background: "var(--sl-card)",
            border: "1px solid var(--sl-border)",
            borderRadius: 16,
            boxShadow: "var(--sl-shadow)",
            padding: 24,
          }}
        >
          {tab === "create" && <CreateMatchForm />}
          {tab === "score" && <UpdateScoreForm />}
          {tab === "commentary" && <AddCommentaryForm />}
        </div>
      </main>
    </div>
  );
}
