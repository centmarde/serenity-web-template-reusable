import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useTarotCardsDataStore, useTarotCardsHelpers, type TarotCardsDeck } from "../../../stores/tarotCardsData";
import { useTarotSelectionStore } from "../../../stores/tarotSelectionData";
import { Heart, User, Calendar, Eye, Plus } from "lucide-react";

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
  "The likely outcome"
];

export const TarotCardsResults: React.FC<TarotCardsResultsProps> = ({
  themeColor,
  bfName,
  gfName,
  onNavigate
}) => {
  const isMobile = useIsMobile();
  const { getMyDecks, getGfDecks, isLoading, error } = useTarotCardsDataStore();
  const { getCardsFromDeck, formatDeckForDisplay, isCompleteReading, getCardDescription } = useTarotCardsHelpers();
  const { setReadingContext, clearAiReading } = useTarotSelectionStore();
  
  
  // State for filtered decks
  const [myDecks, setMyDecks] = React.useState<TarotCardsDeck[]>([]);
  const [gfDecks, setGfDecks] = React.useState<TarotCardsDeck[]>([]);
  const [loadingDecks, setLoadingDecks] = React.useState(true);
  const [hasUserDecksInDB, setHasUserDecksInDB] = React.useState(false);
  const [hasGfDecksInDB, setHasGfDecksInDB] = React.useState(false);

  // Load filtered decks on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadDecks = async () => {
      try {
        setLoadingDecks(true);
        const [userDecks, girlfriendDecks] = await Promise.all([
          getMyDecks(),
          getGfDecks()
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Track if we have any decks in database
          setHasUserDecksInDB(userDecks.length > 0);
          setHasGfDecksInDB(girlfriendDecks.length > 0);
          
          // Filter only complete readings
          setMyDecks(userDecks.filter(isCompleteReading));
          setGfDecks(girlfriendDecks.filter(isCompleteReading));
        }
      } catch (error) {
        if (isMounted) {
          console.error('🔮 Error loading tarot decks:', error);
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
    const cards = getCardsFromDeck(deck);
    const displayInfo = formatDeckForDisplay(deck);

    return (
      <Card 
        key={deck.id}
        className="w-full animate-in fade-in duration-500"
        style={{ borderColor: themeColor }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle 
              className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-lg'}`}
              style={{ color: themeColor }}
            >
              {isGf ? <Heart size={isMobile ? 16 : 20} /> : <User size={isMobile ? 16 : 20} />}
              {isGf ? `${gfName}'s Reading` : `${bfName}'s Reading`}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Calendar size={12} className="mr-1" />
              {displayInfo.date}
            </Badge>
            {displayInfo.endDate && (
              <Badge variant="secondary" className="text-xs ml-2">
                Expires: {displayInfo.endDate}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Cards Grid - Responsive Layout */}
          <div className={`grid gap-3 mb-4 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-2'
          }`}>
            {cards.slice(0, 6).map((card, index) => {
              // Handle null cards gracefully
              if (!card) {
                return (
                  <div key={index} className="border rounded-lg p-3 bg-gray-100 opacity-50">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-400">
                        {CARD_TITLES[index]}
                      </h4>
                      <div className="text-xs text-gray-400">
                        No card selected
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm" style={{ color: themeColor }}>
                        {CARD_TITLES[index]}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {card.name || 'Unknown Card'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-3">
                      {getCardDescription(card) || 'No description available'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View Full Reading Button */}
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate('/tarot-reading');
              }
            }}
            className="w-full mt-2"
            variant="outline"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            <Eye size={16} className="mr-2" />
            View Full Reading
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderEmptySection = (isGf: boolean) => {
    const hasAnyDecksInDB = isGf ? hasGfDecksInDB : hasUserDecksInDB;
    const emptyMessage = hasAnyDecksInDB 
      ? `${isGf ? gfName : bfName} has readings, but none are complete yet`
      : `No ${isGf ? `${gfName}'s` : `${bfName}'s`} readings found in database`;
    
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}10` }}
        >
          {isGf ? <Heart size={32} style={{ color: themeColor }} /> : <User size={32} style={{ color: themeColor }} />}
        </div>
        
        <p className={`text-gray-500 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {emptyMessage}
        </p>
        
        {!hasAnyDecksInDB && (
          <p className={`text-gray-400 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            🔮 Loaded 0 {isGf ? 'girlfriend' : 'user'} decks from database
          </p>
        )}
        
        <Button
          onClick={() => {
            if (onNavigate) {
              // Set reading context immediately in store
              console.log(`🔮 Setting reading context: ${isGf ? 'girlfriend' : 'user'}`);
              setReadingContext(isGf);
              
              // Clear any previous AI reading to ensure fresh start
              clearAiReading();
              
              // Navigate to widget (context is now in store)
              onNavigate('/tarot-cards-widget');
            }
          }}
          variant="outline"
          size="sm"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          <Plus size={14} className="mr-1" />
          Create {isGf ? `${gfName}'s` : 'My'} Reading
        </Button>
      </div>
    );
  };

  if (isLoading || loadingDecks) {
    return (
      <div className="flex justify-center items-center py-12">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColor }}
        />
      </div>
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
      {/* My Readings Section */}
      <section>
        <h2 
          className={`font-bold mb-4 flex items-center gap-2 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}
          style={{ color: themeColor }}
        >
          <User size={isMobile ? 20 : 24} />
          {bfName}'s Readings ({myDecks.length})
        </h2>
        
        {myDecks.length > 0 ? (
          <div className={`grid gap-6 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {myDecks.map(deck => renderDeckCard(deck, false))}
          </div>
        ) : (
          renderEmptySection(false)
        )}
      </section>

      {/* Girlfriend's Readings Section */}
      <section>
        <h2 
          className={`font-bold mb-4 flex items-center gap-2 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}
          style={{ color: themeColor }}
        >
          <Heart size={isMobile ? 20 : 24} />
          {gfName}'s Readings ({gfDecks.length})
        </h2>
        
        {gfDecks.length > 0 ? (
          <div className={`grid gap-6 ${
            isMobile 
              ? 'grid-cols-1' 
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {gfDecks.map(deck => renderDeckCard(deck, true))}
          </div>
        ) : (
          renderEmptySection(true)
        )}
      </section>
    </div>
  );
};