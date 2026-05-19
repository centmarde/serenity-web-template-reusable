import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNullaFoodsStore } from "../../../stores/nullaFoodsData";
import type { UpdateNullaFoodsInput } from "../../../stores/nullaFoodsData";
import { useNullaToysStore } from "../../../stores/nullaToysData";
import type { UpdateNullaToysInput } from "../../../stores/nullaToysData";

interface NullaRewardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FoodKey = "donuts" | "mousse" | "icecream" | "cupcake";
type ToyKey = "mouse" | "softblocks" | "plushdino" | "crystalball";
type Reward =
  | { type: "food"; key: FoodKey; label: string; image: string }
  | { type: "toy"; key: ToyKey; label: string; image: string }
  | { type: "none" };

const NullaRewardsDialog: React.FC<NullaRewardsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const fetchFoods = useNullaFoodsStore((state) => state.fetchFoods);
  const foods = useNullaFoodsStore((state) => state.foods);
  const updateFoods = useNullaFoodsStore((state) => state.updateFoods);
  const createFoods = useNullaFoodsStore((state) => state.createFoods);

  const fetchToys = useNullaToysStore((state) => state.fetchToys);
  const toys = useNullaToysStore((state) => state.toys);
  const updateToys = useNullaToysStore((state) => state.updateToys);
  const createToys = useNullaToysStore((state) => state.createToys);

  const [reward, setReward] = useState<Reward | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const hasAppliedRef = useRef(false);

  const foodOptions = useMemo(
    () => [
      {
        key: "donuts" as const,
        label: "Donut",
        image: "/assets/nulla/foods/donut.png",
      },
      {
        key: "mousse" as const,
        label: "Mousse",
        image: "/assets/nulla/foods/mousse.png",
      },
      {
        key: "icecream" as const,
        label: "Ice Cream",
        image: "/assets/nulla/foods/icecream.png",
      },
      {
        key: "cupcake" as const,
        label: "Cupcake",
        image: "/assets/nulla/foods/cupcake.png",
      },
    ],
    [],
  );

  const toyOptions = useMemo(
    () => [
      {
        key: "mouse" as const,
        label: "Mouse",
        image: "/assets/nulla/toys/mouse.png",
      },
      {
        key: "softblocks" as const,
        label: "Soft Blocks",
        image: "/assets/nulla/toys/softblocks.png",
      },
      {
        key: "plushdino" as const,
        label: "Plush Dino",
        image: "/assets/nulla/toys/plushdino.png",
      },
      {
        key: "crystalball" as const,
        label: "Crystal Ball",
        image: "/assets/nulla/toys/crystalball.png",
      },
    ],
    [],
  );

  const rollReward = (): Reward => {
    const roll = Math.random();
    if (roll < 0.4) {
      const pick = foodOptions[Math.floor(Math.random() * foodOptions.length)];
      return {
        type: "food",
        key: pick.key,
        label: pick.label,
        image: pick.image,
      };
    }
    if (roll < 0.8) {
      const pick = toyOptions[Math.floor(Math.random() * toyOptions.length)];
      return {
        type: "toy",
        key: pick.key,
        label: pick.label,
        image: pick.image,
      };
    }
    return { type: "none" };
  };

  const normalizeFoodName = (value?: string | null) =>
    (value || "").toLowerCase().replace(/\s+/g, "");

  const applyFoodReward = async (key: FoodKey) => {
    const matchedFood = foods.find(
      (food) => normalizeFoodName(food.name) === key,
    );
    const updated: UpdateNullaFoodsInput = {
      count: (matchedFood?.count ?? 0) + 1,
    };

    if (matchedFood?.id) {
      await updateFoods(matchedFood.id, updated);
    } else {
      const option = foodOptions.find((food) => food.key === key);
      await createFoods({
        name: option?.label ?? key,
        count: 1,
        is_unlock: true,
      });
    }
  };

  const normalizeToyName = (value?: string | null) =>
    (value || "").toLowerCase().replace(/\s+/g, "");

  const applyToyReward = async (key: ToyKey) => {
    const matchedToy = toys.find((toy) => normalizeToyName(toy.name) === key);
    const updated: UpdateNullaToysInput = {
      count: (matchedToy?.count ?? 0) + 1,
    };

    if (matchedToy?.id) {
      await updateToys(matchedToy.id, updated);
    } else {
      const option = toyOptions.find((toy) => toy.key === key);
      await createToys({
        name: option?.label ?? key,
        count: 1,
        is_unlock: true,
      });
    }
  };

  const applyReward = async () => {
    if (hasAppliedRef.current) return;
    hasAppliedRef.current = true;
    setHasApplied(true);
    setIsUpdating(true);
    const chosen = reward ?? rollReward();
    setReward(chosen);

    try {
      if (chosen.type === "food") {
        await applyFoodReward(chosen.key);
      } else if (chosen.type === "toy") {
        await applyToyReward(chosen.key);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      void applyReward();
    }
    onOpenChange(nextOpen);
  };

  const handleClaim = async () => {
    await applyReward();
  };

  useEffect(() => {
    if (!open) return;
    setReward(null);
    setHasApplied(false);
    hasAppliedRef.current = false;
    void fetchFoods();
    void fetchToys();
  }, [open, fetchFoods, fetchToys]);

  const rewardMessage = useMemo(() => {
    if (!reward) return "Claim your reward for a chance at food or toys.";
    if (reward.type === "none") return "No reward this time.";
    return `You received +1 ${reward.label}.`;
  }, [reward]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nulla Rewards</DialogTitle>
          <DialogDescription>{rewardMessage}</DialogDescription>
        </DialogHeader>
        {reward && reward.type !== "none" && (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 px-6 py-4">
              <img
                src={reward.image}
                alt={reward.label}
                className="h-16 w-16 object-contain"
              />
              <div className="text-sm text-gray-700">{reward.label}</div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Close
          </Button>
          <Button onClick={handleClaim} disabled={isUpdating || hasApplied}>
            {hasApplied ? "Claimed" : "Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NullaRewardsDialog;
