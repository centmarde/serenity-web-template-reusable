import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip';
import { aiSuggestionsService, type MemorySuggestionRequest } from '../../../lib/AiSuggestions';
import { toast } from 'sonner';

interface AiSuggestionProps {
  type: 'title' | 'description' | 'detail';
  currentText: string;
  context?: {
    date?: string;
    existingTitle?: string;
    existingDescription?: string;
    details?: string[];
  };
  onSuggestionSelect: (suggestion: string) => void;
  themeColor: string;
  className?: string;
}

export const AiSuggestion: React.FC<AiSuggestionProps> = ({
  type,
  currentText,
  context,
  onSuggestionSelect,
  themeColor,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const suggestionsPanelRef = useRef<HTMLDivElement>(null);

  // Calculate button position for portal
  const updateButtonPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = 384; // w-96 = 384px
      const panelHeight = 384; // max-h-96 = 384px
      
      // Calculate optimal left position
      let left = rect.left + window.scrollX - 200; // Center panel relative to button
      const rightBoundary = window.innerWidth - 16; // 16px margin from right edge
      const leftBoundary = 16; // 16px margin from left edge
      
      // Keep within horizontal boundaries
      if (left + panelWidth > rightBoundary) {
        left = rightBoundary - panelWidth;
      }
      if (left < leftBoundary) {
        left = leftBoundary;
      }
      
      // Calculate vertical position
      let top = rect.bottom + window.scrollY + 8; // 8px gap below button
      const bottomBoundary = window.innerHeight + window.scrollY - 16; // 16px margin from bottom
      
      // If panel would go off bottom, position above button instead
      if (top + panelHeight > bottomBoundary) {
        top = rect.top + window.scrollY - panelHeight - 8; // 8px gap above button
      }
      
      setButtonPosition({ top, left });
    }
  };

  useEffect(() => {
    if (showSuggestions) {
      updateButtonPosition();
      const handleResize = () => updateButtonPosition();
      const handleScroll = () => updateButtonPosition();
      const handleClickOutside = (event: MouseEvent) => {
        if (
          suggestionsPanelRef.current &&
          !suggestionsPanelRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const handleGenerateSuggestions = async () => {
    if (!aiSuggestionsService.isConfigured()) {
      toast.error('AI Service Unavailable', {
        description: 'AI suggestions are not configured. Please check your API settings.',
        duration: 4000,
      });
      return;
    }

    // Update position before showing suggestions
    updateButtonPosition();
    
    setIsGenerating(true);
    setSuggestions([]);
    setEnhancedText('');

    try {
      const request: MemorySuggestionRequest = {
        type,
        currentText: currentText.trim() || undefined,
        context
      };

      let response;
      
      if (type === 'title') {
        // For titles, always generate suggestions (multiple options)
        response = currentText.trim() 
          ? await aiSuggestionsService.enhanceText(request)
          : await aiSuggestionsService.generateTitleSuggestions(request);
      } else if (type === 'detail') {
        // For details, always generate suggestions (multiple options)
        response = currentText.trim() 
          ? await aiSuggestionsService.enhanceText(request)
          : await aiSuggestionsService.generateDetailSuggestions(request);
      } else {
        // For descriptions, enhance if text exists, generate if empty
        response = currentText.trim() 
          ? await aiSuggestionsService.enhanceText(request)
          : await aiSuggestionsService.generateDescriptionSuggestion(request);
      }

      if (response.success) {
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
          setShowSuggestions(true);
          toast.success('AI Suggestions Ready! ✨', {
            description: `Generated ${response.suggestions.length} ${type} suggestions for you to choose from.`,
            duration: 3000,
          });
        } else if (response.enhancedText) {
          setEnhancedText(response.enhancedText);
          setShowSuggestions(true);
          toast.success('AI Enhancement Ready! ✨', {
            description: `Your ${type} has been beautifully enhanced.`,
            duration: 3000,
          });
        }
      } else {
        toast.error('AI Generation Failed', {
          description: response.error || 'Failed to generate suggestions. Please try again.',
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Generation Error', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    toast.success('Suggestion Applied! 💕', {
      description: `Your ${type} has been updated with the AI suggestion.`,
      duration: 2000,
    });
  };

  const handleClose = () => {
    setShowSuggestions(false);
  };

  const buttonIcon = isGenerating ? (
    <Loader2 className="w-3 h-3 animate-spin" />
  ) : (
    <Sparkles className="w-3 h-3" />
  );

  const getTooltipText = () => {
    if (isGenerating) {
      return type === 'detail' ? 'Suggesting...' : currentText.trim() ? 'Enhancing...' : 'Generating...';
    }
    if (currentText.trim()) {
      return 'Enhance with AI';
    }
    return type === 'detail' ? 'AI Suggest' : 'AI Suggest';
  };

  const tooltipText = getTooltipText();

  return (
    <div className={`relative z-10 ${className}`}>
      {/* AI Enhancement Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={buttonRef}
              variant="outline"
              size="sm"
              onClick={handleGenerateSuggestions}
              disabled={isGenerating}
              className="h-8 w-8 p-0 transition-all duration-200 hover:shadow-md"
              style={{
                borderColor: themeColor,
                color: themeColor,
                backgroundColor: 'transparent',
              }}
            >
              {buttonIcon}
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="text-xs"
            style={{ 
              backgroundColor: themeColor,
              color: 'white',
              border: 'none'
            }}
          >
            {tooltipText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Suggestions Panel - Rendered as Portal */}
      {showSuggestions && (suggestions.length > 0 || enhancedText) && buttonPosition && 
        createPortal(
          <div 
            ref={suggestionsPanelRef}
            className="fixed z-[10001] pointer-events-auto w-96 animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              top: buttonPosition.top,
              left: buttonPosition.left,
            }}
          >
            <Card 
              className="border-2 shadow-xl bg-white max-h-96 overflow-y-auto"
              style={{ 
                borderColor: `${themeColor}40`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                <h4 className="font-medium text-sm">
                  AI {currentText.trim() ? 'Enhanced' : 'Generated'} {type === 'title' ? 'Titles' : type === 'detail' ? 'Details' : 'Description'}
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0 text-neutral-500 hover:text-neutral-700"
              >
                ×
              </Button>
            </div>

            {/* Title and Detail Suggestions */}
            {(type === 'title' || type === 'detail') && suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-base"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-800 font-medium leading-relaxed">{suggestion}</span>
                      <Badge 
                        variant="secondary" 
                        className="text-sm ml-3 px-3 py-1"
                        style={{ 
                          backgroundColor: `${themeColor}20`,
                          color: themeColor,
                          border: `1px solid ${themeColor}40`
                        }}
                      >
                        Use
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Description Enhancement */}
            {type === 'description' && enhancedText && (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-base text-neutral-800 leading-relaxed">
                    {enhancedText}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSuggestionClick(enhancedText)}
                    className="flex-1"
                    style={{
                      backgroundColor: themeColor,
                      borderColor: themeColor,
                    }}
                  >
                    Use This Description
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateSuggestions}
                    disabled={isGenerating}
                    className="px-3"
                    style={{
                      borderColor: themeColor,
                      color: themeColor,
                    }}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Generate New Button for Titles and Details */}
            {(type === 'title' || type === 'detail') && suggestions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSuggestions}
                disabled={isGenerating}
                className="w-full text-xs"
                style={{
                  borderColor: themeColor,
                  color: themeColor,
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Generate New Suggestions
              </Button>
            )}
          </CardContent>
        </Card>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AiSuggestion;
