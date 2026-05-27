import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import {
  useTarotCardsDataStore,
  type TarotCardData,
  type TarotCardsDeck,
} from "../../../stores/tarotCardsData";
import { getImagePath } from "../../tarotCards/utils";
import { tarotCards } from "../../../composables/tarotConstant";
import { Heart, Sparkles } from "lucide-react";

interface TarotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (path: string) => void;
}

const CARD_TITLES = [
  "How you feel about yourself",
  "What you want most right now",
  "Your fears",
  "What is going for you",
  "What is going against you",
  "The likely outcome",
];

const normalizeCardName = (name: string) => name.trim().toLowerCase();

const TAROT_IMAGE_BY_CARD_NAME = tarotCards.reduce<Record<string, string>>(
  (acc, card) => {
    acc[normalizeCardName(card.name)] = card.image;
    return acc;
  },
  {},
);

const pickGfCardFromDeck = (
  deck: TarotCardsDeck | null,
): { card: TarotCardData; index: number } | null => {
  if (!deck) return null;
  const cards = [
    deck.card1,
    deck.card2,
    deck.card3,
    deck.card4,
    deck.card5,
    deck.card6,
  ];
  const availableIndices = cards
    .map((card, index) => (card ? index : -1))
    .filter((index) => index !== -1);

  if (availableIndices.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  const index = availableIndices[randomIndex];
  const card = cards[index];
  return card ? { card, index } : null;
};

const TarotDialog: React.FC<TarotDialogProps> = ({
  open,
  onOpenChange,
  onNavigate,
}) => {
  const isMobile = useIsMobile();
  const { loadSettings, waitForCallsign, waitForGfName } = useSettingsStore();
  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();
  const { getGfDecks } = useTarotCardsDataStore();

  const [displayData, setDisplayData] = useState<{
    callsign: string;
    gfName: string;
    themeColor: string;
    card: TarotCardData;
    imageSrc: string;
    spreadTitle: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    let didCancel = false;

    const initializeData = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const callsign = await waitForCallsign();
        const gfName = await waitForGfName();
        const themeColor = getCurrentThemeColor();
        const gfDecks = await getGfDecks();
        const latestGfDeck = gfDecks[0] ?? null;
        const selected = pickGfCardFromDeck(latestGfDeck);
        const cardName = selected?.card?.name ? String(selected.card.name) : "";
        const imagePath = cardName
          ? TAROT_IMAGE_BY_CARD_NAME[normalizeCardName(cardName)]
          : undefined;
        const imageSrc = imagePath
          ? getImagePath(imagePath)
          : "/assets/images/tarotCard.png";
        const spreadTitle =
          selected && selected.index >= 0
            ? (CARD_TITLES[selected.index] ?? `Card ${selected.index + 1}`)
            : "";

        if (!didCancel && selected?.card) {
          setDisplayData({
            callsign,
            gfName,
            themeColor,
            card: selected.card,
            imageSrc,
            spreadTitle,
          });
        }
      } catch (error) {
        console.error("Failed to initialize tarot dialog data:", error);
        if (!didCancel) {
          const fallbackCard = tarotCards[0];
          const fallbackDescription = fallbackCard?.description
            ? fallbackCard.description.split("\n\n")[0]
            : "No interpretation available.";
          setDisplayData({
            callsign: "darling",
            gfName: "Love",
            themeColor: "#F2A6A6",
            card: {
              name: fallbackCard?.name || "Tarot Card",
              aiDescription: fallbackDescription,
            },
            imageSrc: getImagePath(fallbackCard?.image || ""),
            spreadTitle: "",
          });
        }
      }
    };

    initializeData();

    return () => {
      didCancel = true;
    };
  }, [
    open,
    initializeTheme,
    waitForInitialization,
    loadSettings,
    waitForCallsign,
    waitForGfName,
    getCurrentThemeColor,
    getGfDecks,
  ]);

  if (!displayData) {
    return null;
  }

  const { callsign, gfName, themeColor, card, imageSrc, spreadTitle } =
    displayData;
  const shortDescription = card.aiDescription
    ? String(card.aiDescription).split("\n\n")[0]
    : "No interpretation available.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isMobile
            ? "max-w-[95vw] max-h-[90vh] overflow-y-auto"
            : "sm:max-w-3xl lg:max-w-4xl max-w-[95vw]"
        }
        style={{ borderColor: themeColor, borderWidth: "2px" }}
      >
        <div
          className={
            isMobile
              ? "space-y-4"
              : "grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
          }
        >
          <div className="flex flex-col items-center space-y-3">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <Sparkles className="w-6 h-6" style={{ color: themeColor }} />
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={imageSrc}
                  alt={card.name || "Tarot card"}
                  className={
                    isMobile
                      ? "w-48 h-48 object-contain rounded-lg"
                      : "w-64 h-64 object-contain rounded-lg"
                  }
                  style={{ border: `2px solid ${themeColor}40` }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/assets/images/tarotCard.png";
                  }}
                />
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            </div>
          </div>

          <div className={isMobile ? "space-y-3" : "md:col-span-2 space-y-4"}>
            <DialogHeader className={isMobile ? "text-center" : "text-left"}>
              <DialogTitle
                className={
                  isMobile ? "text-lg font-semibold" : "text-xl font-semibold"
                }
                style={{ color: themeColor }}
              >
                A tarot whisper for {gfName}
              </DialogTitle>

              <DialogDescription
                className={isMobile ? "space-y-2" : "space-y-2"}
              >
                <p className={isMobile ? "text-sm" : "text-base"}>
                  {callsign}, here&apos;s a gentle reminder from your reading:
                </p>
              </DialogDescription>
            </DialogHeader>

            <Card
              className="border-0"
              style={{
                backgroundColor: `${themeColor}10`,
                borderLeft: `4px solid ${themeColor}`,
              }}
            >
              <CardContent
                className={isMobile ? "p-3 space-y-2" : "p-4 space-y-2"}
              >
                <div
                  className={
                    isMobile
                      ? "flex flex-wrap justify-center gap-2"
                      : "flex flex-wrap gap-2"
                  }
                >
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${themeColor}20`,
                      color: themeColor,
                      borderColor: `${themeColor}40`,
                      border: "1px solid",
                    }}
                  >
                    {card.name}
                  </Badge>

                  {spreadTitle ? (
                    <Badge variant="outline">{spreadTitle}</Badge>
                  ) : null}
                </div>

                <p
                  className={
                    isMobile ? "text-xs text-gray-600" : "text-sm text-gray-600"
                  }
                >
                  {shortDescription}
                </p>
              </CardContent>
            </Card>

            <div
              className={
                isMobile
                  ? "flex flex-col gap-2 pt-1"
                  : "flex justify-end gap-2 pt-2"
              }
            >
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={isMobile ? "w-full text-sm" : "min-w-32"}
                style={{ borderColor: themeColor, color: themeColor }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("/tarot-cards");
                  }
                  onOpenChange(false);
                }}
                className={isMobile ? "w-full text-sm" : "min-w-40"}
                style={{
                  backgroundColor: themeColor,
                  borderColor: themeColor,
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeColor}e0`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeColor;
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                View details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TarotDialog;
