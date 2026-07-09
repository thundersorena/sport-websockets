import * as React from "react";

export function FormHead({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h3
        className="sl-condensed"
        style={{
          fontWeight: 800,
          fontSize: 22,
          textTransform: "uppercase",
          margin: "0 0 3px",
        }}
      >
        {title}
      </h3>
      <p style={{ color: "var(--sl-muted)", margin: "0 0 20px", fontSize: 13.5 }}>
        {desc}
      </p>
    </>
  );
}

export function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label className="sl-flabel" style={style}>
      {label}
      {children}
    </label>
  );
}

export function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p style={{ margin: "14px 0 0", fontSize: 13, color: "#ef4444", lineHeight: 1.4 }}>
      {message}
    </p>
  );
}

/** datetime-local value (YYYY-MM-DDTHH:mm) for a Date in the user's local zone */
export function toLocalInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
