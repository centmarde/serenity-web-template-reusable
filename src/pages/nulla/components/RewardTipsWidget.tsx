import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useThemeStore } from "../../../stores/theme";

const RewardTipsWidget: React.FC = () => {
  const { getCurrentThemeColor, getSafeThemeColor } = useThemeStore();
  const themeColor = getCurrentThemeColor() || getSafeThemeColor();

  const handleNavigateToEvilThoughts = () => {
    window.history.pushState({}, "", "/evil-thoughts");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleNavigateToMemories = () => {
    window.history.pushState({}, "", "/memories");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Card className="mt-4" style={{ border: `1px solid ${themeColor}30` }}>
      <CardContent className="space-y-3 p-3">
        {/* Evil Thoughts Card */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">
            Need more food or toys?
          </div>
          <div className="text-xs text-gray-600">
            Post a thought in Evil Thoughts to earn free rewards for Nulla.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNavigateToEvilThoughts}
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Go to Evil Thoughts
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t" style={{ borderColor: `${themeColor}20` }} />

        {/* Memories Card */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: themeColor }} />
            <div className="text-sm font-semibold text-gray-800">
              Want a bundle reward?
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Create a new memory in your Memories collection to unlock a special bundle reward for Nulla.
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNavigateToMemories}
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Go to Memories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardTipsWidget;
