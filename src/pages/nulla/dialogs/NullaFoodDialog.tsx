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
import RewardTipsWidget from "../components/RewardTipsWidget";

interface NullaFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NullaFoodDialog: React.FC<NullaFoodDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const fetchFoods = useNullaFoodsStore((state) => state.fetchFoods);
  const foodsData = useNullaFoodsStore((state) => state.foods);
  const updateFoods = useNullaFoodsStore((state) => state.updateFoods);
  const fetchNullas = useNullasStore((state) => state.fetchNullas);
  const updateNulla = useNullasStore((state) => state.updateNulla);
  const latestNulla = useNullasStore((state) => state.nullas[0] ?? null);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const foods = useMemo(() => {
    const catalog = {
      donuts: {
        label: "Donut",
        image: "/assets/nulla/foods/donut.png",
        duration: 10,
      },
      mousse: {
        label: "Mousse",
        image: "/assets/nulla/foods/mousse.png",
        duration: 4,
      },
      icecream: {
        label: "Ice Cream",
        image: "/assets/nulla/foods/icecream.png",
        duration: 8,
      },
      cupcake: {
        label: "Cupcake",
        image: "/assets/nulla/foods/cupcake.png",
        duration: 5,
      },
    };

    return foodsData.map((food) => {
      const normalizedName = (food.name || "")
        .toLowerCase()
        .replace(/\s+/g, "");
      const meta = catalog[normalizedName as keyof typeof catalog];

      return {
        id: food.id,
        key: normalizedName || "unknown",
        label: meta?.label ?? food.name ?? "Food",
        image: meta?.image ?? "/assets/nulla/foods/donut.png",
        count: food.count ?? 0,
        duration: meta?.duration ?? 6,
        isUnlocked: food.is_unlock !== false,
      };
    });
  }, [foodsData]);

  const selectedFood = foods.find((food) => food.id === selectedFoodId) ?? null;

  const handlePickFood = (id: number, count: number, isUnlocked: boolean) => {
    if (!isUnlocked || count <= 0) return;
    setSelectedFoodId(id);
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
      const updated: UpdateNullaFoodsInput = {
        count: Math.max(0, (selectedFood.count ?? 0) - 1),
      };
      await updateFoods(selectedFood.id, updated);
    } finally {
      setIsUpdating(false);
      setIsConfirmOpen(false);
      setSelectedFoodId(null);
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
              key={food.id}
              type="button"
              onClick={() =>
                handlePickFood(food.id, food.count, food.isUnlocked)
              }
              disabled={food.count <= 0 || !food.isUnlocked}
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
