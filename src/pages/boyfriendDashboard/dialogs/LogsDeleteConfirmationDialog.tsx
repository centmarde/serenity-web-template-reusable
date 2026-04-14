import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSettingsStore } from '../../../stores/settings';
import { formatDateTimeDetailed } from '../utils/helpers';
import { Trash2, Calendar } from 'lucide-react';
import type { Log } from '../../../stores/logsData';

interface LogsDeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  log: Log | null;
  isLoading?: boolean;
}

const LogsDeleteConfirmationDialog: React.FC<LogsDeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  log,
  isLoading = false
}) => {
  const { getThemeColor } = useSettingsStore();
  const themeColor = getThemeColor();

  const getLogTypeDisplay = (log: Log) => {
    if (log.is_sad_letter === true) return { type: 'Sad Letter', color: 'text-red-600', icon: '💔' };
    if (log.is_miss_letter === true) return { type: 'Miss Letter', color: 'text-pink-600', icon: '💕' };
    return { type: 'General Log', color: 'text-gray-600', icon: '📝' };
  };

  if (!log) return null;

  const logDisplay = getLogTypeDisplay(log);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Log Entry
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Are you sure you want to permanently delete this log entry? This action cannot be undone.
              </p>
              
              {/* Log Details Card */}
              <div 
                className="p-3 rounded-lg border-l-4 bg-gray-50"
                style={{ borderLeftColor: themeColor }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">{logDisplay.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${logDisplay.color}`}>
                      {logDisplay.type}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTimeDetailed(log.created_at || '')}
                    </div>
                  </div>
                </div>
                
                {/* Additional details if available */}
                {(log.device || log.address) && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {log.device && (
                      <div className="truncate" title={log.device}>
                        📱 {log.device.split('(')[0].trim()}
                      </div>
                    )}
                    {log.address && (
                      <div className="truncate" title={log.address}>
                        📍 {log.address.split('(')[0].trim()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Forever
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogsDeleteConfirmationDialog;