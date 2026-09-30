"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TFC GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#FFF4E8", color: "#1B1712", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 400 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5A4E44", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            A critical error occurred. Please try reloading the page.
            {error.digest && <span style={{ display: "block", marginTop: 8, fontSize: 11, color: "#8C7D70" }}>ID: {error.digest}</span>}
          </p>
          <button
            onClick={reset}
            style={{ background: "#E2542A", color: "#fff", border: "none", borderRadius: 99, padding: "10px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
