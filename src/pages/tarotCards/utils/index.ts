// Helper functions for tarot card functionality

/**
 * Removes 'public/' prefix from image paths since assets are served from root
 */
export const getImagePath = (imagePath: string): string => {
  return imagePath.replace('public/', '/');
};

/**
 * Calculates position and rotation for card in deck spread layout
 */
export const calculateCardPosition = (index: number, totalCards: number, isMobile: boolean = false) => {
  if (isMobile) {
    // Mobile layout: Dynamic rows to prevent horizontal scroll
    const cardSpacing = 75; // Reduced spacing between cards (70px card + 5px margin)
    const containerMaxWidth = 380; // Max usable width (400px - padding)
    const maxCardsPerRow = Math.floor(containerMaxWidth / cardSpacing);
    
    // Calculate actual cards per row and number of rows needed
    const cardsPerRow = Math.min(maxCardsPerRow, totalCards);
    const totalRows = Math.ceil(totalCards / cardsPerRow);
    
    // Current card position
    const row = Math.floor(index / cardsPerRow);
    const col = index % cardsPerRow;
    
    // Cards in current row (last row might have fewer cards)
    const cardsInCurrentRow = row === totalRows - 1 
      ? totalCards - (totalRows - 1) * cardsPerRow 
      : cardsPerRow;
    
    // Card dimensions and spacing for mobile
    const rowHeight = 110; // Reduced height between rows for compactness
    
    // Center cards in each row
    const rowWidth = (cardsInCurrentRow - 1) * cardSpacing;
    const leftPosition = -rowWidth / 2 + col * cardSpacing;
    const topPosition = (row - (totalRows - 1) / 2) * rowHeight; // Center vertically around 0
    
    return { 
      leftPosition, 
      topPosition, 
      rotation: 0, // No rotation on mobile for better readability
      isMobileLayout: true
    };
  }
  
  // Desktop layout: horizontal spread
  const spreadWidth = Math.min(1200, window.innerWidth * 0.85); // Use 85% of screen width, max 1200px
  const cardSpacing = spreadWidth / (totalCards - 1);
  const totalWidth = (totalCards - 1) * cardSpacing;
  const leftPosition = -totalWidth / 2 + index * cardSpacing; // Center cards around position 0
  const rotation = 0; // No rotation for clean straight layout
  
  return { 
    leftPosition, 
    topPosition: 0, 
    rotation,
    isMobileLayout: false
  };
};