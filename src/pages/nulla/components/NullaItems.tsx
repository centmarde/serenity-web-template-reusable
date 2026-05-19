import React, { useEffect, useState } from "react";
import { useNullasStore } from "../../../stores/nullasData";
import { formatDate } from "../helpers/nullaCounter";
import NullaFoodDialog from "../dialogs/NullaFoodDialog";
import NullaToysDialog from "../dialogs/NullaToysDialog";

interface NullaItemsProps {
  themeColor: string;
}

const NullaItems: React.FC<NullaItemsProps> = ({ themeColor }) => {
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [isFoodOpen, setIsFoodOpen] = useState(false);
  const [isToysOpen, setIsToysOpen] = useState(false);

  useEffect(() => {
    void fetchNullas();
  }, [fetchNullas]);

  return (
    <div
      className="w-full space-y-3"
      style={{
        border: `1px solid ${themeColor}20`,
        borderRadius: "14px",
        padding: "min(14px, 4vw)",
        backgroundColor: `${themeColor}08`,
      }}
    >
      <div className="text-center text-sm text-gray-700">
        <strong>Last eaten:</strong> {formatDate(latestNulla?.last_eaten)}
      </div>
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setIsFoodOpen(true)}
          disabled={!latestNulla}
          className="rounded-full p-2 transition-transform hover:scale-105 disabled:opacity-60"
          aria-label="Feed Nulla"
          title="Feed"
        >
          <img
            src="/assets/nulla/foods/donut.png"
            alt="Feed"
            className="h-12 w-12"
          />
        </button>
        <button
          type="button"
          onClick={() => setIsToysOpen(true)}
          disabled={!latestNulla}
          className="rounded-full p-2 transition-transform hover:scale-105 disabled:opacity-60"
          aria-label="Play with Nulla"
          title="Play"
        >
          <img
            src="/assets/nulla/toys/mouse.png"
            alt="Play"
            className="h-12 w-12"
          />
        </button>
      </div>
      <NullaFoodDialog open={isFoodOpen} onOpenChange={setIsFoodOpen} />
      <NullaToysDialog open={isToysOpen} onOpenChange={setIsToysOpen} />
    </div>
  );
};

export default NullaItems;
