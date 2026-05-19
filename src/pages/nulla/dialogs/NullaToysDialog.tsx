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

interface NullaToysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NullaToysDialog: React.FC<NullaToysDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const fetchToys = useNullaToysStore((state) => state.fetchToys);
  const latestToys = useNullaToysStore((state) => state.toys[0] ?? null);
  const getLatestToys = useNullaToysStore((state) => state.getLatestToys);
  const updateToys = useNullaToysStore((state) => state.updateToys);
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const updateNulla = useNullasStore((state) => state.updateNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toys = useMemo(
    () => [
      {
        key: "mouse",
        label: "Mouse",
        image: "/assets/nulla/toys/mouse.png",
        count: latestToys?.mouse ?? 0,
        duration: 8,
      },
      {
        key: "softblocks",
        label: "Soft Blocks",
        image: "/assets/nulla/toys/softblocks.png",
        count: latestToys?.softblocks ?? 0,
        duration: 12,
      },
      {
        key: "plushdino",
        label: "Plush Dino",
        image: "/assets/nulla/toys/plushdino.png",
        count: latestToys?.plushdino ?? 0,
        duration: 10,
      },
      {
        key: "crystalball",
        label: "Crystal Ball",
        image: "/assets/nulla/toys/crystalball.png",
        count: latestToys?.crystalball ?? 0,
        duration: 3,
      },
    ],
    [latestToys],
  );

  const selectedToy = toys.find((toy) => toy.key === selectedKey) ?? null;

  const handlePickToy = (key: string, count: number) => {
    if (count <= 0) return;
    setSelectedKey(key);
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
      const latestToysRecord = getLatestToys();
      if (latestToysRecord && latestToysRecord.id) {
        const updated: UpdateNullaToysInput = {};
        switch (selectedToy.key) {
          case "mouse":
            updated.mouse = Math.max(0, (latestToysRecord.mouse || 0) - 1);
            break;
          case "softblocks":
            updated.softblocks = Math.max(
              0,
              (latestToysRecord.softblocks || 0) - 1,
            );
            break;
          case "plushdino":
            updated.plushdino = Math.max(
              0,
              (latestToysRecord.plushdino || 0) - 1,
            );
            break;
          case "crystalball":
            updated.crystalball = Math.max(
              0,
              (latestToysRecord.crystalball || 0) - 1,
            );
            break;
        }
        await updateToys(latestToysRecord.id, updated);
      }
    } finally {
      setIsUpdating(false);
      setIsConfirmOpen(false);
      setSelectedKey(null);
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
              key={toy.key}
              type="button"
              onClick={() => handlePickToy(toy.key, toy.count)}
              disabled={toy.count <= 0}
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
      </DialogContent>
      <NullaConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
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
