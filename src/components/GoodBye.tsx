import { useState, useEffect, useRef } from "react";

export default function GoodBye() {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const farewellMessage = `Thank you for these five months. They may have been short, but they gave me memories I'll carry for a lifetime. I'll always cherish every moment we spent together—the genuine laughter, the late conversations, the quiet moments, and every second that made me believe we had something real.

As we go our separate ways, I just want you to remember one thing: I loved you sincerely, and I cared for you with everything I had. Even if this is where our story ends, a part of me will always be grateful that our paths crossed.

Take care of yourself. Goodbye.`;

  useEffect(() => {
    // Type out the farewell message character by character
    let charIndex = 0;
    const typingSpeed = 30; // ms per character

    intervalRef.current = setInterval(() => {
      if (charIndex < farewellMessage.length) {
        setDisplayedText(farewellMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, typingSpeed);

    // Blink cursor
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(cursorInterval);
    };
  }, []);

  // Split text by newlines for display
  const displayLines = displayedText.split("\n");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#e8d5b7",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        zIndex: 99999,
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Decorative heart */}
      <div
        style={{
          fontSize: "3rem",
          marginBottom: "2rem",
          opacity: 0.8,
          animation: "goodbye-heart-pulse 1.5s ease-in-out infinite",
        }}
      >
        💔
      </div>

      {/* Farewell message with typewriter effect */}
      <div
        style={{
          fontSize: "1.2rem",
          lineHeight: 1.8,
          maxWidth: "650px",
          whiteSpace: "pre-wrap",
          fontStyle: "italic",
          textAlign: "left",
        }}
      >
        {displayLines.map((line, index) => (
          <div key={index}>
            {line}
            {index === displayLines.length - 1 && showCursor && (
              <span style={{ opacity: 0.7 }}>|</span>
            )}
          </div>
        ))}
      </div>

      {/* Subtle fade-in message at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          fontSize: "0.9rem",
          opacity: 0.4,
          letterSpacing: "2px",
          textTransform: "uppercase",
          lineHeight: 2,
        }}
      >
        ~ until we meet again ~
        <br />~ july 27, 2026 — chubabi signing off ~
      </div>

      {/* Keyframes for heart pulse */}
      <style>{`
        @keyframes goodbye-heart-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
