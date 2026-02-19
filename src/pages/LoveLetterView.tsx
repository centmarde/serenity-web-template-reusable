import React, { useState, useEffect } from "react";
import { useSettingsStore } from "../stores/settings";
import { useThemeStore } from "../stores/theme";
import { Button } from "@/components/ui/button";

import { 
  Heart, 
  Mail, 
  Frown,
  HeartHandshake,
  PartyPopper
} from "lucide-react";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import SentMeLoveLetterSection from "./loveLetter/components/SentMeLoveLetterSection";

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
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Love Letter View:", error);
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
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${data.themeColor}15, ${data.themeColor}30, #ffffff)`,
      }}
    >
      {/* Main Content with Padding */}
      <div className="p-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1
            className="flex items-center justify-center gap-3 text-gray-800 font-bold mb-4"
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              color: "#333333",
            }}
          >
            <Mail
              size={32}
              fill={data.themeColor}
              color={data.themeColor}
              className="animate-pulse"
            />
            Love Letters
            <Heart
              size={32}
              fill={data.themeColor}
              color={data.themeColor}
              className="animate-pulse"
            />
          </h1>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.25rem)",
              color: "#666666",
            }}
          >
            Special letters for different moments in our love story. Choose when you're ready to open them ✨
          </p>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6 max-w-7xl mx-auto px-4 relative">
        {/* Card 1: Open when you're sad */}
        <CardContainer className="inter-var h-[450px]">
          <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border flex flex-col">
            <CardItem
              translateZ="50"
              className="text-xl font-bold text-neutral-600 dark:text-white"
            >
              <div
                className="flex items-center gap-3 mb-4"
                style={{ color: data.themeColor }}
              >
                <Frown size={28} />
                <span style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
                  Open when you're sad
                </span>
              </div>
            </CardItem>

            <CardItem
              as="p"
              translateZ="60"
              className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
            >
              A gentle reminder of how much you mean to me when the world feels heavy 💙
            </CardItem>

            <CardItem
              translateZ="100"
              rotateX={20}
              rotateZ={-10}
              className="w-full mt-4 flex-1"
            >
              <div
                className="h-48 w-full rounded-xl flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${data.themeColor}60, ${data.themeColor}80)`,
                  minHeight: '200px',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
                <div className="relative z-10 text-center">
                  <img
                    src="/assets/sad.gif"
                    alt="Comfort hug"
                    className="w-24 h-24 mx-auto mb-4 opacity-90"
                  />
                  <p style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                    "You're stronger than you know"
                  </p>
                </div>
              </div>
            </CardItem>

            <div className="flex justify-center items-center mt-auto">
              <CardItem
                translateZ={20}
                translateX={-20}
                as={Button}
                className="px-6 py-3 rounded-xl text-white font-bold"
                style={{
                  backgroundColor: data.themeColor,
                  fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                }}
              >
                Open Letter
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>

        {/* Card 2: Open when you miss me */}
        <CardContainer className="inter-var h-[450px]">
          <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border flex flex-col">
            <CardItem
              translateZ="50"
              className="text-xl font-bold text-neutral-600 dark:text-white"
            >
              <div
                className="flex items-center gap-3 mb-4"
                style={{ color: data.themeColor }}
              >
                <HeartHandshake size={28} />
                <span style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
                  Open when you miss me
                </span>
              </div>
            </CardItem>

            <CardItem
              as="p"
              translateZ="60"
              className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
            >
              For moments when distance feels too far and you need to feel close 💕
            </CardItem>

            <CardItem
              translateZ="100"
              rotateX={20}
              rotateZ={10}
              className="w-full mt-4 flex-1"
            >
              <div
                className="h-48 w-full rounded-xl flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${data.themeColor}60, ${data.themeColor}80)`,
                  minHeight: '200px',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-red-400/20"></div>
                <div className="relative z-10 text-center">
                  <img
                    src="/assets/peach-goma.gif"
                    alt="Missing you"
                    className="w-24 h-24 mx-auto mb-4 opacity-90"
                  />
                  <p style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                    "I'm always with you in spirit"
                  </p>
                </div>
              </div>
            </CardItem>

            <div className="flex justify-center items-center mt-auto">
              <CardItem
                translateZ={20}
                translateX={20}
                as={Button}
                className="px-6 py-3 rounded-xl text-white font-bold"
                style={{
                  backgroundColor: data.themeColor,
                  fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                }}
              >
                Open Letter
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>

        {/* Card 3: Open on our 1st anniversary */}
        <CardContainer className="inter-var h-[450px]">
          <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl p-6 border flex flex-col">
            <CardItem
              translateZ="50"
              className="text-xl font-bold text-neutral-600 dark:text-white"
            >
              <div
                className="flex items-center gap-3 mb-4"
                style={{ color: data.themeColor }}
              >
                <PartyPopper size={28} />
                <span style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.3rem)" }}>
                  Open on our 1st anniversary
                </span>
              </div>
            </CardItem>

            <CardItem
              as="p"
              translateZ="60"
              className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              style={{ fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}
            >
              A celebration of our first year and all the beautiful memories 🎉
            </CardItem>

            <CardItem
              translateZ="100"
              rotateX={20}
              rotateZ={-5}
              className="w-full mt-4 flex-1"
            >
              <div
                className="h-48 w-full rounded-xl flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${data.themeColor}60, ${data.themeColor}80)`,
                  minHeight: '200px',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20"></div>
                <div className="relative z-10 text-center">
                  <img
                    src="/assets/dudu-cute.gif"
                    alt="Anniversary celebration"
                    className="w-24 h-24 mx-auto mb-4 opacity-90"
                  />
                  <p style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}>
                    "Here's to our first year of forever"
                  </p>
                </div>
              </div>
            </CardItem>

            <div className="flex justify-center items-center mt-auto">
              <CardItem
                translateZ={20}
                translateX={-10}
                as={Button}
                className="px-6 py-3 rounded-xl text-white font-bold"
                style={{
                  backgroundColor: data.themeColor,
                  fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                }}
              >
                Open Letter
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>

        </div>

        {/* Send Me Love Letter Section */}
        <div className="mt-12 mb-8">
          <SentMeLoveLetterSection />
        </div>
      </div>

      {/* Full-width SVG Wave at bottom */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path 
            fill={data.themeColor} 
            fillOpacity="0.8" 
            d="M0,32L17.1,69.3C34.3,107,69,181,103,202.7C137.1,224,171,192,206,186.7C240,181,274,203,309,197.3C342.9,192,377,160,411,133.3C445.7,107,480,85,514,80C548.6,75,583,85,617,101.3C651.4,117,686,139,720,165.3C754.3,192,789,224,823,218.7C857.1,213,891,171,926,176C960,181,994,235,1029,229.3C1062.9,224,1097,160,1131,144C1165.7,128,1200,160,1234,165.3C1268.6,171,1303,149,1337,128C1371.4,107,1406,85,1423,74.7L1440,64L1440,320L1422.9,320C1405.7,320,1371,320,1337,320C1302.9,320,1269,320,1234,320C1200,320,1166,320,1131,320C1097.1,320,1063,320,1029,320C994.3,320,960,320,926,320C891.4,320,857,320,823,320C788.6,320,754,320,720,320C685.7,320,651,320,617,320C582.9,320,549,320,514,320C480,320,446,320,411,320C377.1,320,343,320,309,320C274.3,320,240,320,206,320C171.4,320,137,320,103,320C68.6,320,34,320,17,320L0,320Z"
          />
        </svg>
      </div>
    </div>
    
  );
};

export default LoveLetterView;
