import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  Mail, 
  Send, 
  Plus, 
  Calendar,
  User,
  MessageSquare 
} from "lucide-react";

interface LoveLetter {
  id: string;
  title: string;
  content: string;
  date: string;
  from: string;
  to: string;
  isRead: boolean;
}

interface ComponentData {
  themeColor: string;
  callsign: string;
  bfName: string;
  gfName: string;
  appName: string;
  startingGreetings: string;
}

const LoveLetterView: React.FC = () => {
  const {
    getCallsign,
    getBfName,
    getGfName,
    getAppName,
    getStartingGreetings,
    loadSettings,
  } = useSettingsStore();

  const { initializeTheme, getCurrentThemeColor, waitForInitialization } =
    useThemeStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [showNewLetter, setShowNewLetter] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [newLetterTitle, setNewLetterTitle] = useState("");
  const [newLetterContent, setNewLetterContent] = useState("");

  // Sample love letters for demo
  const getSampleLetters = (): LoveLetter[] => [
    {
      id: "1",
      title: "My Dearest Love",
      content: "Every morning I wake up grateful that you're in my life. Your smile brightens even my darkest days, and your laugh is my favorite sound in the world. I want you to know that my love for you grows stronger with each passing moment. You are my heart, my soul, and my everything. 💕",
      date: "2026-02-14",
      from: "Your Forever Love",
      to: "My Beautiful Girlfriend",
      isRead: false,
    },
    {
      id: "2", 
      title: "Thinking of You",
      content: "I was just thinking about the way you scrunch your nose when you're concentrating, and it made me smile so big. You have no idea how many little things you do that make me fall in love with you all over again. I can't wait to hold you in my arms tonight. ✨",
      date: "2026-02-10",
      from: "Your Devoted Boyfriend",
      to: "My Sweet Angel",
      isRead: true,
    },
    {
      id: "3",
      title: "Our Future Together",
      content: "I dream about our future together - lazy Sunday mornings, adventures around the world, building a home filled with love and laughter. With you by my side, I know every dream is possible. You make me want to be the best version of myself. I love you more than words can express. 🌟",
      date: "2026-02-05",
      from: "Your Life Partner",
      to: "My Soulmate",
      isRead: true,
    }
  ];

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTheme();
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          bfName: getBfName(),
          gfName: getGfName(),
          appName: getAppName(),
          startingGreetings: getStartingGreetings(),
        };

        setData(loadedData);
        setLetters(getSampleLetters());
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Love Letter View:", error);
        const fallbackThemeColor = getCurrentThemeColor() || "#F2A6A6";

        setData({
          themeColor: fallbackThemeColor,
          callsign: "darling",
          bfName: "Love",
          gfName: "Beautiful",
          appName: "Love Space",
          startingGreetings: "baby",
        });

        setLetters(getSampleLetters());
        setIsLoading(false);
      }
    };
    initialize();
  }, [
    initializeTheme,
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getBfName,
    getGfName,
    getAppName,
    getStartingGreetings,
  ]);

  const handleCreateLetter = () => {
    if (!newLetterTitle.trim() || !newLetterContent.trim() || !data) return;

    const newLetter: LoveLetter = {
      id: Date.now().toString(),
      title: newLetterTitle.trim(),
      content: newLetterContent.trim(),
      date: new Date().toISOString().split('T')[0],
      from: data.gfName,
      to: data.bfName,
      isRead: false,
    };

    setLetters([newLetter, ...letters]);
    setNewLetterTitle("");
    setNewLetterContent("");
    setShowNewLetter(false);
  };

  const handleLetterClick = (letter: LoveLetter) => {
    setSelectedLetter(letter);
    // Mark as read
    setLetters(letters.map(l => 
      l.id === letter.id ? { ...l, isRead: true } : l
    ));
  };

  if (isLoading || !data) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${data?.themeColor || '#F2A6A6'}20, ${data?.themeColor || '#F2A6A6'}40, #ffffff)`,
        }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: data?.themeColor || getCurrentThemeColor() }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}15, ${data.themeColor}30, #ffffff)`,
      }}
    >
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${data.themeColor}20`,
                border: `3px solid ${data.themeColor}`,
              }}
            >
              <Mail size={36} color={data.themeColor} />
            </div>
          </div>
          
          <h1
            className="text-3xl font-bold flex items-center justify-center gap-3"
            style={{ color: data.themeColor }}
          >
            <Heart size={28} fill={data.themeColor} />
            Love Letters
            <Heart size={28} fill={data.themeColor} />
          </h1>
          
          <p className="text-gray-600 text-lg">
            Messages of love between {data.gfName} & {data.bfName} 💕
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letters List */}
          <div className="lg:col-span-1 space-y-4">
            {/* New Letter Button */}
            <Button
              onClick={() => setShowNewLetter(true)}
              className="w-full flex items-center gap-2"
              style={{
                backgroundColor: data.themeColor,
                borderColor: data.themeColor,
              }}
            >
              <Plus size={16} />
              Write New Letter
            </Button>

            {/* Letters List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare size={20} />
                  Your Letters ({letters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {letters.map((letter) => (
                      <Card
                        key={letter.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedLetter?.id === letter.id
                            ? 'ring-2'
                            : 'hover:scale-[1.02]'
                        }`}
                        style={{
                          borderColor: selectedLetter?.id === letter.id ? data.themeColor : undefined,
                        }}
                        onClick={() => handleLetterClick(letter)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm truncate flex-1">
                              {letter.title}
                            </h4>
                            {!letter.isRead && (
                              <Badge
                                variant="default"
                                className="text-xs ml-2"
                                style={{ backgroundColor: data.themeColor }}
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {letter.content}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {letter.from}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(letter.date).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Letter Display/Editor */}
          <div className="lg:col-span-2">
            {showNewLetter ? (
              /* New Letter Editor */
              <Card>
                <CardHeader>
                  <CardTitle
                    className="flex items-center gap-2"
                    style={{ color: data.themeColor }}
                  >
                    <Send size={20} />
                    Write a New Love Letter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Letter Title
                    </label>
                    <Input
                      placeholder="Give your letter a sweet title..."
                      value={newLetterTitle}
                      onChange={(e) => setNewLetterTitle(e.target.value)}
                      style={{ borderColor: `${data.themeColor}30` }}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Your Message
                    </label>
                    <Textarea
                      placeholder={`Dear ${data.bfName},\n\nWrite your heart out here... 💕`}
                      value={newLetterContent}
                      onChange={(e) => setNewLetterContent(e.target.value)}
                      rows={12}
                      className="resize-none"
                      style={{ borderColor: `${data.themeColor}30` }}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateLetter}
                      disabled={!newLetterTitle.trim() || !newLetterContent.trim()}
                      style={{
                        backgroundColor: data.themeColor,
                        borderColor: data.themeColor,
                      }}
                    >
                      <Send size={16} className="mr-2" />
                      Send Letter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewLetter(false);
                        setNewLetterTitle("");
                        setNewLetterContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : selectedLetter ? (
              /* Selected Letter Display */
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle
                        className="text-xl mb-2"
                        style={{ color: data.themeColor }}
                      >
                        {selectedLetter.title}
                      </CardTitle>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p className="flex items-center gap-2">
                          <User size={14} />
                          From: {selectedLetter.from}
                        </p>
                        <p className="flex items-center gap-2">
                          <Heart size={14} />
                          To: {selectedLetter.to}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          {new Date(selectedLetter.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={selectedLetter.isRead ? "secondary" : "default"}
                      style={{
                        backgroundColor: selectedLetter.isRead ? "#f3f4f6" : data.themeColor,
                      }}
                    >
                      {selectedLetter.isRead ? "Read" : "New"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none p-6 rounded-lg"
                    style={{
                      backgroundColor: `${data.themeColor}05`,
                      border: `1px solid ${data.themeColor}20`,
                    }}
                  >
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedLetter.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Welcome Screen */
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center space-y-4 py-16">
                  <div
                    className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${data.themeColor}15`,
                      border: `2px solid ${data.themeColor}30`,
                    }}
                  >
                    <Mail size={48} style={{ color: `${data.themeColor}80` }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700">
                    Welcome to Your Love Letters
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    Select a letter from the left to read it, or write a new one to express your feelings! 💕
                  </p>
                  <Button
                    onClick={() => setShowNewLetter(true)}
                    className="mt-4"
                    style={{
                      backgroundColor: data.themeColor,
                      borderColor: data.themeColor,
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Write Your First Letter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveLetterView;
