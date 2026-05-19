import React, { useEffect, useMemo, useState } from "react";
// confirmation dialog handled by NullaConfirmationDialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNullaToysStore } from "../../../stores/nullaToysData";
import type { UpdateNullaToysInput } from "../../../stores/nullaToysData";
import { useNullasStore } from "../../../stores/nullasData";
import { getNextMode } from "../helpers/nullaCounter";
import NullaConfirmationDialog from "./NullaConfirmationDialog";
import RewardTipsWidget from "../components/RewardTipsWidget";

interface NullaToysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NullaToysDialog: React.FC<NullaToysDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const fetchToys = useNullaToysStore((state) => state.fetchToys);
  const toysData = useNullaToysStore((state) => state.toys);
  const updateToys = useNullaToysStore((state) => state.updateToys);
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const updateNulla = useNullasStore((state) => state.updateNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [selectedToyId, setSelectedToyId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toys = useMemo(() => {
    const catalog = {
      mouse: {
        label: "Mouse",
        image: "/assets/nulla/toys/mouse.png",
        duration: 8,
      },
      softblocks: {
        label: "Soft Blocks",
        image: "/assets/nulla/toys/softblocks.png",
        duration: 12,
      },
      plushdino: {
        label: "Plush Dino",
        image: "/assets/nulla/toys/plushdino.png",
        duration: 10,
      },
      crystalball: {
        label: "Crystal Ball",
        image: "/assets/nulla/toys/crystalball.png",
        duration: 3,
      },
    };

    return toysData.map((toy) => {
      const normalizedName = (toy.name || "").toLowerCase().replace(/\s+/g, "");
      const meta = catalog[normalizedName as keyof typeof catalog];

      return {
        id: toy.id,
        key: normalizedName || "unknown",
        label: meta?.label ?? toy.name ?? "Toy",
        image: meta?.image ?? "/assets/nulla/toys/mouse.png",
        count: toy.count ?? 0,
        duration: meta?.duration ?? 6,
        isUnlocked: toy.is_unlock !== false,
      };
    });
  }, [toysData]);

  const selectedToy = toys.find((toy) => toy.id === selectedToyId) ?? null;

  const handlePickToy = (id: number, count: number, isUnlocked: boolean) => {
    if (!isUnlocked || count <= 0) return;
    setSelectedToyId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmPlay = async () => {
    if (!latestNulla || !selectedToy || isUpdating) return;
    setIsUpdating(true);
    try {
      // update nulla timestamps/durations
      const now = Date.now();
      const lastPlayingIso = new Date().toISOString();
      const nextNulla = {
        ...latestNulla,
        last_playing: lastPlayingIso,
        playing_duration: selectedToy.duration,
      };
      const nextMode = getNextMode(nextNulla, now);

      await updateNulla(latestNulla.id, {
        last_playing: lastPlayingIso,
        playing_duration: selectedToy.duration,
        ...(nextMode ? { mode: nextMode } : {}),
      });

      // decrement toy inventory safely
      const updated: UpdateNullaToysInput = {
        count: Math.max(0, (selectedToy.count ?? 0) - 1),
      };
      await updateToys(selectedToy.id, updated);
    } finally {
      setIsUpdating(false);
      setIsConfirmOpen(false);
      setSelectedToyId(null);
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void fetchToys();
    void fetchNullas();
  }, [open, fetchToys, fetchNullas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Play With Nulla</DialogTitle>
          <DialogDescription>Pick a toy for playtime.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {toys.map((toy) => (
            <button
              key={toy.id}
              type="button"
              onClick={() => handlePickToy(toy.id, toy.count, toy.isUnlocked)}
              disabled={toy.count <= 0 || !toy.isUnlocked}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                src={toy.image}
                alt={toy.label}
                className="h-14 w-14 object-contain"
              />
              <div className="text-center">
                <div className="text-sm text-gray-700">{toy.label}</div>
                <div className="text-xs text-gray-500">x{toy.count}</div>
              </div>
            </button>
          ))}
        </div>
        <RewardTipsWidget />
      </DialogContent>
      <NullaConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={(nextOpen) => {
          setIsConfirmOpen(nextOpen);
          if (!nextOpen) {
            onOpenChange(false);
          }
        }}
        title="Play With Nulla"
        description={
          selectedToy
            ? `Use ${selectedToy.label} for playtime?`
            : "Choose a toy for playtime."
        }
        confirmLabel="Play"
        onConfirm={handleConfirmPlay}
        isConfirmDisabled={!selectedToy || isUpdating || !latestNulla}
        isCancelDisabled={isUpdating}
      />
    </Dialog>
  );
};

export default NullaToysDialog;
