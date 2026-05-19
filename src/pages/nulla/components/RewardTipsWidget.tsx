import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "../../../stores/theme";

const RewardTipsWidget: React.FC = () => {
  const { getCurrentThemeColor, getSafeThemeColor } = useThemeStore();
  const themeColor = getCurrentThemeColor() || getSafeThemeColor();

  const handleNavigate = () => {
    window.history.pushState({}, "", "/evil-thoughts");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Card className="mt-4" style={{ border: `1px solid ${themeColor}30` }}>
      <CardContent className="space-y-2 p-3">
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
          onClick={handleNavigate}
          style={{ borderColor: themeColor, color: themeColor }}
        >
          Go to Evil Thoughts
        </Button>
      </CardContent>
    </Card>
  );
};

export default RewardTipsWidget;
