import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  useTarotCardsDataStore,
  useTarotCardsHelpers,
  type TarotCardData,
  type TarotCardsDeck,
} from "../../../stores/tarotCardsData";
import { useTarotSelectionStore } from "../../../stores/tarotSelectionData";
import { tarotCards } from "../../../composables/tarotConstant";
import CardViewer from "../dialogs/CardViewer";
import PasswordDialog from "../../evilThoughts/dialogs/PasswordDialog";
import { getImagePath } from "../utils";
import { getTimeZoneDayMs, TAROT_TIME_ZONE } from "../utils/helpers";
import { Heart, User, Calendar, Plus } from "lucide-react";

interface TarotCardsResultsProps {
  themeColor: string;
  bfName: string;
  gfName: string;
  onNavigate?: (path: string) => void;
}

// Move cardTitles outside component to prevent recreation on every render
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

export const TarotCardsResults: React.FC<TarotCardsResultsProps> = ({
  themeColor,
  bfName,
  gfName,
  onNavigate,
}) => {
  const isMobile = useIsMobile();
  const { getMyDecks, getGfDecks, deleteDeck, isLoading, error } =
    useTarotCardsDataStore();
  const { formatDeckForDisplay, isCompleteReading, getCardDescription } =
    useTarotCardsHelpers();
  const { setReadingContext, clearAiReading } = useTarotSelectionStore();

  // State for filtered decks
  const [myDecks, setMyDecks] = React.useState<TarotCardsDeck[]>([]);
  const [gfDecks, setGfDecks] = React.useState<TarotCardsDeck[]>([]);
  const [loadingDecks, setLoadingDecks] = React.useState(true);
  const [hasUserDecksInDB, setHasUserDecksInDB] = React.useState(false);
  const [hasGfDecksInDB, setHasGfDecksInDB] = React.useState(false);

  const [latestUserDeck, setLatestUserDeck] =
    React.useState<TarotCardsDeck | null>(null);
  const [latestGfDeck, setLatestGfDeck] = React.useState<TarotCardsDeck | null>(
    null,
  );

  const [cardViewer, setCardViewer] = React.useState<{
    card: TarotCardData;
    spreadTitle: string;
    imageSrc: string;
  } | null>(null);

  const [bfPasswordOpen, setBfPasswordOpen] = React.useState(false);
  const [isActionBusy, setIsActionBusy] = React.useState(false);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const parseDateSafe = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const shouldAllowNewReading = (deck: TarotCardsDeck | null): boolean => {
    if (!deck) return false;

    const created = parseDateSafe(deck.created_at);
    const end = parseDateSafe(deck.end_date);

    // If end date is missing/invalid, allow creating a fresh reading
    if (!created || !end) return true;

    const createdDay = getTimeZoneDayMs(created, TAROT_TIME_ZONE);
    const endDay = getTimeZoneDayMs(end, TAROT_TIME_ZONE);
    const nowDay = getTimeZoneDayMs(new Date(), TAROT_TIME_ZONE);

    // Same day OR end_date before created_at => invalid
    if (endDay <= createdDay) return true;

    const diffDays = Math.floor((endDay - createdDay) / MS_PER_DAY);

    // More than 30 days between created_at and end_date => invalid
    if (diffDays > 30) return true;

    // Expired (today is after end_date)
    if (nowDay > endDay) return true;

    return false;
  };

  const handleCreateReading = async (isGf: boolean) => {
    if (!onNavigate) return;

    setIsActionBusy(true);
    console.log(
      `🔮 Starting new reading (context: ${isGf ? "girlfriend" : "user"})`,
    );

    try {
      // Set context + clear previous AI session first
      setReadingContext(isGf);
      clearAiReading();

      const deckToDelete = isGf ? latestGfDeck : latestUserDeck;

      if (shouldAllowNewReading(deckToDelete) && deckToDelete) {
        console.log(
          `🔮 Deleting existing deck before creating new reading: ${deckToDelete.id}`,
        );
        const ok = await deleteDeck(deckToDelete.id);
        if (!ok) {
          console.error(
            "🔮 Failed to delete existing deck; aborting create flow to avoid duplicates",
          );
          setIsActionBusy(false);
          return;
        }
      }

      onNavigate("/tarot-cards-widget");
    } catch (e) {
      console.error("🔮 Failed to start create reading flow:", e);
      setIsActionBusy(false);
    }
  };

  // Load filtered decks on mount
  useEffect(() => {
    let isMounted = true;

    const loadDecks = async () => {
      try {
        setLoadingDecks(true);
        const [userDecks, girlfriendDecks] = await Promise.all([
          getMyDecks(),
          getGfDecks(),
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          // Track if we have any decks in database
          setHasUserDecksInDB(userDecks.length > 0);
          setHasGfDecksInDB(girlfriendDecks.length > 0);

          // Track latest decks (sorted desc by created_at)
          setLatestUserDeck(userDecks[0] ?? null);
          setLatestGfDeck(girlfriendDecks[0] ?? null);

          // Filter only complete readings
          setMyDecks(userDecks.filter(isCompleteReading));
          setGfDecks(girlfriendDecks.filter(isCompleteReading));
        }
      } catch (error) {
        if (isMounted) {
          console.error("🔮 Error loading tarot decks:", error);
        }
      } finally {
        if (isMounted) {
          setLoadingDecks(false);
        }
      }
    };

    loadDecks();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only on mount

  const renderDeckCard = (deck: TarotCardsDeck, isGf: boolean) => {
    // Keep exact spread positions (do NOT filter nulls), so titles align with 1..6
    const cards = [
      deck.card1,
      deck.card2,
      deck.card3,
      deck.card4,
      deck.card5,
      deck.card6,
    ];
    const displayInfo = formatDeckForDisplay(deck);

    return (
      <Card
        key={deck.id}
        className="w-full animate-in fade-in duration-500"
        style={{ borderColor: themeColor }}
      >
        <CardHeader className="pb-3">
          <div
            className={`flex ${
              isMobile
                ? "flex-col items-center text-center gap-2"
                : "flex-row items-center justify-between"
            }`}
          >
            <CardTitle
              className={`flex items-center gap-2 ${
                isMobile ? "text-sm justify-center w-full" : "text-lg"
              }`}
              style={{ color: themeColor }}
            >
              {isGf ? (
                <Heart size={isMobile ? 16 : 20} />
              ) : (
                <User size={isMobile ? 16 : 20} />
              )}
              {isGf ? `${gfName}'s Reading` : `${bfName}'s Reading`}
            </CardTitle>

            <div
              className={`flex items-center gap-2 ${
                isMobile ? "justify-center w-full" : "justify-end"
              }`}
            >
              <Badge variant="secondary" className="text-xs">
                <Calendar size={12} className="mr-1" />
                {displayInfo.date}
              </Badge>
              {displayInfo.endDate && (
                <Badge variant="secondary" className="text-xs">
                  Expires: {displayInfo.endDate}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Cards Row */}
          <div
            className={
              isMobile
                ? "grid grid-cols-1 gap-3 mb-4"
                : "flex gap-3 mb-4 overflow-x-auto pb-2"
            }
          >
            {cards.map((card, index) => {
              const cardName = card?.name ? String(card.name) : "";
              const imagePath = cardName
                ? TAROT_IMAGE_BY_CARD_NAME[normalizeCardName(cardName)]
                : undefined;

              const imageSrc = imagePath
                ? getImagePath(imagePath)
                : "/assets/images/tarotCard.png";

              return (
                <button
                  key={`${deck.id}-${index}`}
                  type="button"
                  disabled={!card}
                  onClick={() => {
                    if (!card) return;
                    setCardViewer({
                      card,
                      spreadTitle: CARD_TITLES[index] ?? `Card ${index + 1}`,
                      imageSrc,
                    });
                  }}
                  className={`border rounded-lg p-3 bg-gray-50 text-left transition-colors ${
                    isMobile ? "w-full" : "flex-none"
                  } ${
                    card
                      ? "cursor-pointer hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      : "cursor-default opacity-60"
                  }`}
                  style={{
                    width: isMobile ? "100%" : "240px",
                    borderColor: `${themeColor}40`,
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className="font-semibold text-sm"
                        style={{ color: themeColor }}
                      >
                        {CARD_TITLES[index]}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {cardName || "Unknown"}
                      </Badge>
                    </div>

                    <div className="w-full rounded bg-white border overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={cardName || `Card ${index + 1}`}
                        className="w-full object-cover"
                        style={{ height: isMobile ? "300px" : "400px" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/images/tarotCard.png";
                        }}
                      />
                    </div>

                    <div className="text-xs text-gray-600 line-clamp-3">
                      {card
                        ? getCardDescription(card) || "No description available"
                        : "No card selected"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptySection = (isGf: boolean) => {
    const hasAnyDecksInDB = isGf ? hasGfDecksInDB : hasUserDecksInDB;
    const emptyMessage = hasAnyDecksInDB
      ? `${isGf ? gfName : bfName} has readings, but none are complete yet`
      : `No ${isGf ? `${gfName}'s` : `${bfName}'s`} readings found`;

    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}10` }}
        >
          {isGf ? (
            <Heart size={32} style={{ color: themeColor }} />
          ) : (
            <User size={32} style={{ color: themeColor }} />
          )}
        </div>

        <p
          className={`text-gray-500 mb-2 ${isMobile ? "text-sm" : "text-base"}`}
        >
          {emptyMessage}
        </p>

        {!hasAnyDecksInDB && (
          <p
            className={`text-gray-400 mb-4 ${isMobile ? "text-xs" : "text-sm"}`}
          >
            🔮 Loaded 0 {isGf ? "girlfriend" : "user"} decks from database
          </p>
        )}

        <Button
          onClick={() =>
            isGf ? void handleCreateReading(true) : setBfPasswordOpen(true)
          }
          variant="outline"
          size="sm"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          <Plus size={14} className="mr-1" />
          Create {isGf ? `${gfName}'s` : `${bfName}'s`} Reading
        </Button>
      </div>
    );
  };

  if (isLoading || loadingDecks) {
    return (
      <LoadingOverlay
        isOpen={true}
        themeColor={themeColor}
        title="Loading your tarot readings…"
        description="Please wait"
      />
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading tarot readings</div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <LoadingOverlay
        isOpen={isActionBusy}
        themeColor={themeColor}
        title="Creating your new reading…"
        description="Preparing the deck"
      />

      <CardViewer
        isOpen={cardViewer !== null}
        onOpenChange={(open) => {
          if (!open) setCardViewer(null);
        }}
        themeColor={themeColor}
        card={cardViewer?.card ?? null}
        spreadTitle={cardViewer?.spreadTitle}
        imageSrc={cardViewer?.imageSrc}
      />

      <PasswordDialog
        isOpen={bfPasswordOpen}
        onClose={() => setBfPasswordOpen(false)}
        onSuccess={() => {
          void handleCreateReading(false);
        }}
        title="Boyfriend Reading"
        description={`Enter password to create a reading for ${bfName}.`}
      />

      {/* My Readings Section */}
      <section>
        <div
          className={
            isMobile
              ? "flex flex-col items-center gap-2 mb-4"
              : "flex items-center justify-between mb-4"
          }
        >
          <div
            className={
              isMobile
                ? "w-full flex flex-col items-center gap-1"
                : "flex flex-col"
            }
          >
            <h2
              className={`font-bold flex items-center gap-2 ${
                isMobile ? "text-lg" : "text-xl"
              }`}
              style={{ color: themeColor }}
            >
              <User size={isMobile ? 20 : 24} />
              {bfName}'s Readings ({myDecks.length})
            </h2>

            {shouldAllowNewReading(latestUserDeck) ? (
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isMobile ? "text-center" : ""
                }`}
                style={{ color: `${themeColor}B3` }}
              >
                Your new reading is ready — tap the button to create it.
              </p>
            ) : null}
          </div>

          {shouldAllowNewReading(latestUserDeck) ? (
            <Button
              onClick={() => setBfPasswordOpen(true)}
              variant="default"
              size="sm"
              className={`font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isMobile ? "w-full" : ""
              }`}
              style={{ backgroundColor: themeColor, color: "white" }}
            >
              <span className="relative mr-2 inline-flex items-center justify-center">
                <span
                  className="absolute inline-flex h-5 w-5 rounded-full bg-white/30 animate-ping"
                  aria-hidden="true"
                />
                <Plus size={14} className="relative animate-pulse" />
              </span>
              Create My Reading
            </Button>
          ) : null}
        </div>

        {myDecks.length > 0 ? (
          <div
            className={`grid gap-6 ${
              isMobile
                ? "grid-cols-1"
                : myDecks.length > 1
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
            }`}
          >
            {myDecks.map((deck) => renderDeckCard(deck, false))}
          </div>
        ) : (
          renderEmptySection(false)
        )}
      </section>

      {/* Girlfriend's Readings Section */}
      <section>
        <div
          className={
            isMobile
              ? "flex flex-col items-center gap-2 mb-4"
              : "flex items-center justify-between mb-4"
          }
        >
          <div
            className={
              isMobile
                ? "w-full flex flex-col items-center gap-1"
                : "flex flex-col"
            }
          >
            <h2
              className={`font-bold flex items-center gap-2 ${
                isMobile ? "text-lg" : "text-xl"
              }`}
              style={{ color: themeColor }}
            >
              <Heart size={isMobile ? 20 : 24} />
              {gfName}'s Readings ({gfDecks.length})
            </h2>

            {shouldAllowNewReading(latestGfDeck) ? (
              <p
                className={`text-xs sm:text-sm font-medium ${
                  isMobile ? "text-center" : ""
                }`}
                style={{ color: `${themeColor}B3` }}
              >
                Your new reading is ready — tap the button to create it.
              </p>
            ) : null}
          </div>

          {shouldAllowNewReading(latestGfDeck) ? (
            <Button
              onClick={() => handleCreateReading(true)}
              variant="default"
              size="sm"
              className={`font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] hover:opacity-95 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isMobile ? "w-full" : ""
              }`}
              style={{ backgroundColor: themeColor, color: "white" }}
            >
              <span className="relative mr-2 inline-flex items-center justify-center">
                <span
                  className="absolute inline-flex h-5 w-5 rounded-full bg-white/30 animate-ping"
                  aria-hidden="true"
                />
                <Plus size={14} className="relative animate-pulse" />
              </span>
              Create {gfName}'s new Reading
            </Button>
          ) : null}
        </div>

        {gfDecks.length > 0 ? (
          <div
            className={`grid gap-6 ${
              isMobile
                ? "grid-cols-1"
                : gfDecks.length > 1
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1"
            }`}
          >
            {gfDecks.map((deck) => renderDeckCard(deck, true))}
          </div>
        ) : (
          renderEmptySection(true)
        )}
      </section>
    </div>
  );
};
