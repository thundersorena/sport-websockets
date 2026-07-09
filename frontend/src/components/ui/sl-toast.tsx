"use client";

import { useEffect } from "react";

interface SlToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

/**
 * Bottom-center pill toast matching the Sport Live design.
 * Keyed on the message so each new message replays the entrance animation.
 */
export function SlToast({ message, onClose, duration = 2600 }: SlToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="sl-toast" key={message} role="status" aria-live="polite">
      {message}
    </div>
  );
}
