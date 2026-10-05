import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function GoodBye({ onProceed }: { onProceed: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingFinished, setIsTypingFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobile = useIsMobile();

  const farewellMessage = `Thank you for these five months. They may have been short, but they gave me memories I'll carry for a lifetime. I'll always cherish every moment we spent together—the genuine laughter, the late conversations, the quiet moments, and every second that made me believe we had something real.

As we go our separate ways, I just want you to remember one thing: I loved you sincerely, and I cared for you with everything I had. Even if this is where our story ends, a part of me will always be grateful that our paths crossed.

Take care of yourself. Goodbye.`;

  useEffect(() => {
    // Type out the farewell message character by character
    let charIndex = 0;
    const typingSpeed = 15; // ms per character (2x faster)

    intervalRef.current = setInterval(() => {
      if (charIndex < farewellMessage.length) {
        setDisplayedText(farewellMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        // Typing complete - trigger the proceed button to show
        setIsTypingFinished(true);
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
        padding: isMobile ? "1rem" : "2rem",
        textAlign: "center",
      }}
    >
      {/* Decorative heart + proceed button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isMobile ? "1rem" : "1.5rem",
          marginBottom: isMobile ? "1.5rem" : "2rem",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "2rem" : "3rem",
            opacity: 0.8,
            animation: "goodbye-heart-pulse 1.5s ease-in-out infinite",
          }}
        >
          💔
        </div>

        {/* Proceed button - appears only after typing is done */}
        {isTypingFinished && (
          <button
            onClick={onProceed}
            style={{
              position: "relative",
              padding: isMobile ? "0.5rem 1.2rem" : "0.6rem 1.6rem",
              fontSize: isMobile ? "0.8rem" : "0.95rem",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "#1a1a2e",
              background: "#e8d5b7",
              border: "none",
              borderRadius: "999px",
              cursor: "pointer",
              letterSpacing: "1px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.35)",
              transition: "background 0.2s ease",
              pointerEvents: "auto",
              zIndex: 2147483647,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f4e6c9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#e8d5b7";
            }}
          >
            Proceed to the App
          </button>
        )}
      </div>

      {/* Farewell message with typewriter effect - scrollable so the header (heart + button) always stays on screen */}
      <div
        style={{
          fontSize: isMobile ? "0.88rem" : "1.2rem",
          lineHeight: isMobile ? 1.7 : 1.8,
          maxWidth: "650px",
          maxHeight: isMobile ? "42vh" : "55vh",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          fontStyle: "italic",
          textAlign: "left",
          padding: "0 0.5rem",
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
          bottom: isMobile ? "1.5rem" : "3rem",
          fontSize: isMobile ? "0.7rem" : "0.9rem",
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
