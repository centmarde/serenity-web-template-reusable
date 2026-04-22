import React, { useEffect } from "react";
import { useThoughtsStore } from "../stores/thoughtsData";
import { cn } from "@/lib/utils";

export interface EvilThoughtsBadgeProps {
  className?: string;
}

const EvilThoughtsBadge: React.FC<EvilThoughtsBadgeProps> = ({ className }) => {
  const initializeThoughts = useThoughtsStore((s) => s.initializeThoughts);
  const bfActiveThoughtCount = useThoughtsStore((s) => s.activeBfThoughtCount);
  const gfActiveThoughtCount = useThoughtsStore((s) => s.activeGfThoughtCount);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeThoughts();
      } catch (error) {
        console.error("Failed to initialize thoughts:", error);
      }
    };

    void initialize();
  }, [initializeThoughts]);

  const hasAnyActiveThoughts = bfActiveThoughtCount > 0 || gfActiveThoughtCount > 0;

  const formatCount = (count: number) => {
    if (count <= 0) return "";
    return count > 99 ? "99+" : String(count);
  };

  if (!hasAnyActiveThoughts) return null;

  return (
    <span className={cn("flex gap-1", className)}>
      {bfActiveThoughtCount > 0 && (
        <span className="h-4 min-w-4 px-1 rounded-full bg-blue-500 text-white text-[10px] leading-4 text-center">
          {formatCount(bfActiveThoughtCount)}
        </span>
      )}
      {gfActiveThoughtCount > 0 && (
        <span className="h-4 min-w-4 px-1 rounded-full bg-purple-500 text-white text-[10px] leading-4 text-center">
          {formatCount(gfActiveThoughtCount)}
        </span>
      )}
    </span>
  );
};

export default EvilThoughtsBadge;
