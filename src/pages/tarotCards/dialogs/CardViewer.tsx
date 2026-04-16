import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "../../../hooks/use-mobile";
import type { TarotCardData } from "../../../stores/tarotCardsData";

interface CardViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  themeColor: string;
  card: TarotCardData | null;
  spreadTitle?: string;
  imageSrc?: string;
}

const CardViewer: React.FC<CardViewerProps> = ({
  isOpen,
  onOpenChange,
  themeColor,
  card,
  spreadTitle,
  imageSrc,
}) => {
  const isMobile = useIsMobile();

  if (!card) return null;

  const safeImageSrc = imageSrc || "/assets/images/tarotCard.png";
  const description = String(card.aiDescription || "");

  const extraFields = Object.entries(card)
    .filter(([key, value]) => {
      if (key === "name" || key === "aiDescription") return false;
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
    })
    .slice(0, 8);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isMobile
            ? "max-w-[calc(100%-1rem)] p-4 max-h-[calc(100vh-1rem)] overflow-y-auto"
            : "sm:max-w-3xl"
        }
        style={{ borderColor: themeColor, borderWidth: 2 }}
      >
        <DialogHeader>
          <DialogTitle
            className={isMobile ? "flex flex-col items-center text-center gap-1" : "flex items-center gap-2"}
            style={{ color: themeColor }}
          >
            <span className="truncate max-w-full">{card.name || "Unknown Card"}</span>
            {spreadTitle ? (
              <Badge variant="secondary" className={isMobile ? "shrink-0" : "shrink-0"}>
                {spreadTitle}
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription className={isMobile ? "text-center" : undefined}>
            Tap outside or press ESC to close.
          </DialogDescription>
        </DialogHeader>

        <div className={isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 gap-4 sm:grid-cols-[260px_1fr]"}>
          <div className={isMobile ? "w-full max-w-[340px] mx-auto" : "w-full"}>
            <div className="w-full rounded-lg border bg-white overflow-hidden">
              <img
                src={safeImageSrc}
                alt={card.name || "Tarot card"}
                className={isMobile ? "w-full object-contain" : "w-full object-cover"}
                style={{ height: isMobile ? "min(240px, 30vh)" : "min(420px, 50vh)" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/images/tarotCard.png";
                }}
              />
            </div>

            {extraFields.length > 0 ? (
              <div className={isMobile ? "flex flex-wrap gap-2 mt-3 justify-center" : "flex flex-wrap gap-2 mt-3"}>
                {extraFields.map(([key, value]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <ScrollArea
              className={
                isMobile
                  ? "h-[38vh] rounded-lg border bg-muted/30 p-3"
                  : "h-[45vh] sm:h-[420px] rounded-lg border bg-muted/30 p-4"
              }
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {description || "No description available."}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardViewer;
