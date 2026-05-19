import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNullaFoodsStore } from "../../../stores/nullaFoodsData";
import type { UpdateNullaFoodsInput } from "../../../stores/nullaFoodsData";
import { useNullasStore } from "../../../stores/nullasData";
import { getNextMode } from "../helpers/nullaCounter";
import NullaConfirmationDialog from "./NullaConfirmationDialog";

interface NullaFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NullaFoodDialog: React.FC<NullaFoodDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const fetchFoods = useNullaFoodsStore((state) => state.fetchFoods);
  const latestFoods = useNullaFoodsStore((state) => state.foods[0] ?? null);
  const getLatestFoods = useNullaFoodsStore((state) => state.getLatestFoods);
  const updateFoods = useNullaFoodsStore((state) => state.updateFoods);
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const updateNulla = useNullasStore((state) => state.updateNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const foods = useMemo(
    () => [
      {
        key: "donuts",
        label: "Donut",
        image: "/assets/nulla/foods/donut.png",
        count: latestFoods?.donuts ?? 0,
        duration: 10,
      },
      {
        key: "mousse",
        label: "Mousse",
        image: "/assets/nulla/foods/mousse.png",
        count: latestFoods?.mousse ?? 0,
        duration: 4,
      },
      {
        key: "icecream",
        label: "Ice Cream",
        image: "/assets/nulla/foods/icecream.png",
        count: latestFoods?.icecream ?? 0,
        duration: 8,
      },
      {
        key: "cupcake",
        label: "Cupcake",
        image: "/assets/nulla/foods/cupcake.png",
        count: latestFoods?.cupcake ?? 0,
        duration: 5,
      },
    ],
    [latestFoods],
  );

  const selectedFood = foods.find((food) => food.key === selectedKey) ?? null;

  const handlePickFood = (key: string, count: number) => {
    if (count <= 0) return;
    setSelectedKey(key);
    setIsConfirmOpen(true);
  };

  const handleConfirmFeed = async () => {
    if (!latestNulla || !selectedFood || isUpdating) return;
    setIsUpdating(true);
    try {
      // update nulla timestamps/durations
      const now = Date.now();
      const lastEatenIso = new Date().toISOString();
      const nextNulla = {
        ...latestNulla,
        last_eaten: lastEatenIso,
        eaten_duration: selectedFood.duration,
      };
      const nextMode = getNextMode(nextNulla, now);

      await updateNulla(latestNulla.id, {
        last_eaten: lastEatenIso,
        eaten_duration: selectedFood.duration,
        ...(nextMode ? { mode: nextMode } : {}),
      });

      // decrement food inventory safely
      const latestFoodsRecord = getLatestFoods();
      if (latestFoodsRecord && latestFoodsRecord.id) {
        const updated: UpdateNullaFoodsInput = {};
        switch (selectedFood.key) {
          case "donuts":
            updated.donuts = Math.max(0, (latestFoodsRecord.donuts || 0) - 1);
            break;
          case "mousse":
            updated.mousse = Math.max(0, (latestFoodsRecord.mousse || 0) - 1);
            break;
          case "icecream":
            updated.icecream = Math.max(
              0,
              (latestFoodsRecord.icecream || 0) - 1,
            );
            break;
          case "cupcake":
            updated.cupcake = Math.max(0, (latestFoodsRecord.cupcake || 0) - 1);
            break;
        }
        // call updateFoods to persist the new counts
        await updateFoods(latestFoodsRecord.id, updated);
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
    void fetchFoods();
    void fetchNullas();
  }, [open, fetchFoods, fetchNullas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feed Nulla</DialogTitle>
          <DialogDescription>Choose a treat for Nulla.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {foods.map((food) => (
            <button
              key={food.key}
              type="button"
              onClick={() => handlePickFood(food.key, food.count)}
              disabled={food.count <= 0}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                src={food.image}
                alt={food.label}
                className="h-14 w-14 object-contain"
              />
              <div className="text-center">
                <div className="text-sm text-gray-700">{food.label}</div>
                <div className="text-xs text-gray-500">x{food.count}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
      <NullaConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Feed Nulla"
        description={
          selectedFood
            ? `Use ${selectedFood.label} to feed Nulla?`
            : "Choose a food to feed Nulla."
        }
        confirmLabel="Feed"
        onConfirm={handleConfirmFeed}
        isConfirmDisabled={!selectedFood || isUpdating || !latestNulla}
        isCancelDisabled={isUpdating}
      />
    </Dialog>
  );
};

export default NullaFoodDialog;
