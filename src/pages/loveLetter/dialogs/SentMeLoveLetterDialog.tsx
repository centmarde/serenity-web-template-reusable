import React, { useState, useEffect, useRef } from "react";
import { useSettingsStore } from "../../../stores/settings";
import { useThemeStore } from "../../../stores/theme";
import useMessagesStore from "../../../stores/messagesData";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Edit3, FileText } from "lucide-react";
import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";
import SentConfirmationDialog from "./SentConfirmationDialog";
import SuccessDialog from "../../../components/dialogs/SuccessDialog";
import ErrorDialog from "../../../components/dialogs/ErrorDialog";

interface ComponentData {
  themeColor: string;
  callsign: string;
  bfName: string;
  gfName: string;
}

interface SentMeLoveLetterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SentMeLoveLetterDialog: React.FC<SentMeLoveLetterDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const {
    getCallsign,
    getBfName,
    getGfName,
    loadSettings,
  } = useSettingsStore();

  const { getCurrentThemeColor, waitForInitialization } = useThemeStore();

  const { createLetter } = useMessagesStore();

  const [data, setData] = useState<ComponentData | null>(null);
  const [letterTitle, setLetterTitle] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useMarkdownEditor, setUseMarkdownEditor] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingContent, setPendingContent] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const easyMDERef = useRef<EasyMDE | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await waitForInitialization();
        await loadSettings();

        const loadedData: ComponentData = {
          themeColor: getCurrentThemeColor(),
          callsign: getCallsign(),
          bfName: getBfName(),
          gfName: getGfName(),
        };

        setData(loadedData);
      } catch (error) {
        console.error("Failed to initialize Send Love Letter Dialog:", error);
      }
    };
    initialize();
  }, [
    waitForInitialization,
    loadSettings,
    getCurrentThemeColor,
    getCallsign,
    getBfName,
    getGfName,
  ]);

  // Initialize EasyMDE when markdown editor is enabled
  useEffect(() => {
    if (isOpen && data && editorRef.current && useMarkdownEditor && !easyMDERef.current) {
      easyMDERef.current = new EasyMDE({
        element: editorRef.current,
        placeholder: `My Dearest ${data.bfName || 'Love'},\n\nWrite your love letter here... 💕\n\nYou can use **bold**, *italic*, and other markdown formatting!`,
        spellChecker: false,
        autosave: {
          enabled: false,
          uniqueId: "love-letter-editor",
        },
        toolbar: [
          "bold", "italic", "strikethrough", "|",
          "heading-1", "heading-2", "heading-3", "|",
          "quote", "unordered-list", "ordered-list", "|",
          "link", "image", "|",
          "preview", "side-by-side", "fullscreen", "|",
          "guide"
        ],
        initialValue: letterContent || "",
      });

      easyMDERef.current.codemirror.on("change", () => {
        if (easyMDERef.current) {
          setLetterContent(easyMDERef.current.value());
        }
      });
    }

    // Cleanup when switching away from markdown editor or dialog closes
    if ((!useMarkdownEditor || !isOpen) && easyMDERef.current) {
      const currentValue = easyMDERef.current.value();
      setLetterContent(currentValue);
      easyMDERef.current.toTextArea();
      easyMDERef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data, useMarkdownEditor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentContent = easyMDERef.current ? easyMDERef.current.value() : letterContent;
    if (!letterTitle.trim() || !currentContent.trim()) return;

    // Capture current content and open confirmation dialog
    setPendingContent(currentContent);
    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setIsSubmitting(true);

    try {
      const result = await createLetter({
        title: letterTitle.trim(),
        message: pendingContent.trim(),
        category: "love",
        is_girlfriend: true,
        user_id: null,  // explicitly null — bypasses auth.uid() RLS injection
      });

      setShowConfirmation(false);

      if (result) {
        // Reset form on success
        setLetterTitle("");
        setLetterContent("");
        setPendingContent("");
        if (easyMDERef.current) {
          easyMDERef.current.value("");
        }
        onOpenChange(false);
        setShowSuccess(true);
      } else {
        setShowError(true);
        setErrorMessage("Your letter couldn't be saved. Please try again.");
      }
    } catch (error) {
      console.error("Failed to send love letter:", error);
      setShowConfirmation(false);
      setShowError(true);
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>

      <DialogContent
        className="sm:max-w-2xl max-w-[95vw] mx-auto"
        style={{
          borderColor: data.themeColor,
          background: '#ffffff',
        }}
      >
        <style>
          {`
            .EasyMDEContainer .CodeMirror {
              border: 2px solid ${data.themeColor}30;
              background-color: ${data.themeColor}05;
              border-radius: 6px;
              min-height: 200px;
            }
            .EasyMDEContainer .CodeMirror-focused {
              border-color: ${data.themeColor}60;
              box-shadow: 0 0 0 2px ${data.themeColor}20;
            }
            .EasyMDEContainer .editor-toolbar {
              border-top: 2px solid ${data.themeColor}30;
              border-left: 2px solid ${data.themeColor}30;
              border-right: 2px solid ${data.themeColor}30;
              border-bottom: none;
              background: ${data.themeColor}05;
            }
            .EasyMDEContainer .editor-toolbar a {
              color: ${data.themeColor}80 !important;
            }
            .EasyMDEContainer .editor-toolbar a:hover {
              background: ${data.themeColor}15 !important;
              border-color: ${data.themeColor}40 !important;
            }
            .EasyMDEContainer .editor-toolbar.fullscreen {
              background: white;
            }
          `}
        </style>

        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div>
            <Input
              placeholder="Letter title..."
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              className="border-2 focus:ring-2 transition-all duration-200"
              style={{
                borderColor: `${data.themeColor}30`,
                backgroundColor: `${data.themeColor}05`,
              }}
              disabled={isSubmitting}
            />
          </div>

          {/* Editor Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Editor Mode:</span>
              <span className="text-sm text-gray-500">
                {useMarkdownEditor ? "Advanced (Markdown)" : "Simple (Text)"}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUseMarkdownEditor(!useMarkdownEditor)}
              className="flex items-center gap-2 transition-all duration-200"
              style={{
                borderColor: data.themeColor,
                color: useMarkdownEditor ? '#ffffff' : data.themeColor,
                backgroundColor: useMarkdownEditor ? data.themeColor : 'transparent',
              }}
              disabled={isSubmitting}
            >
              {useMarkdownEditor ? (
                <>
                  <Edit3 size={14} />
                  <span>Switch to Simple</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>Switch to Advanced</span>
                </>
              )}
            </Button>
          </div>

          <div>
            {useMarkdownEditor ? (
              <textarea
                ref={editorRef}
                placeholder={`My Dearest ${data.bfName || 'Love'},\n\nWrite your love letter here... 💕`}
                defaultValue={letterContent}
                rows={10}
                className="border-2 focus:ring-2 transition-all duration-200 resize-none w-full"
                style={{
                  borderColor: `${data.themeColor}30`,
                  backgroundColor: `${data.themeColor}05`,
                }}
                disabled={isSubmitting}
              />
            ) : (
              <textarea
                placeholder={`My Dearest ${data.bfName || 'Love'},\n\nWrite your love letter here... 💕\n\nTell me about your day, your dreams, or just how much you love me 😝.`}
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                rows={10}
                className="border-2 focus:ring-2 transition-all duration-200 resize-none w-full"
                style={{
                  borderColor: `${data.themeColor}30`,
                  backgroundColor: `${data.themeColor}05`,
                }}
                disabled={isSubmitting}
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 transition-all duration-200"
              style={{
                borderColor: data.themeColor,
                color: data.themeColor,
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: data.themeColor }}
              disabled={isSubmitting || !letterTitle.trim() || !letterContent.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div
                    className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
                  />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send size={16} />
                  <span>Send Letter</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Confirmation Dialog */}
    <SentConfirmationDialog
      isOpen={showConfirmation}
      onOpenChange={setShowConfirmation}
      onConfirm={handleConfirmSend}
      isSubmitting={isSubmitting}
      themeColor={data.themeColor}
      letterTitle={letterTitle}
      recipientName={data.bfName || "Love"}
    />

    {/* Success Dialog */}
    <SuccessDialog
      isOpen={showSuccess}
      onOpenChange={setShowSuccess}
      themeColor={data.themeColor}
      recipientName={data.bfName || "Love"}
    />

    {/* Error Dialog */}
    <ErrorDialog
      isOpen={showError}
      onOpenChange={setShowError}
      themeColor={data.themeColor}
      message={errorMessage}
      onRetry={() => setShowConfirmation(true)}
    />
    </>
  );
};

export default SentMeLoveLetterDialog;
