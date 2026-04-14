import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types
export interface Log {
  id?: number;
  created_at?: string;
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
}

export interface LogCreate {
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
}

export interface LogUpdate {
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
}

interface LogsState {
  // State
  logs: Log[];
  currentLog: Log | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLogs: (logs: Log[]) => void;
  setCurrentLog: (log: Log | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  fetchLogs: () => Promise<void>;
  fetchLogById: (id: number) => Promise<Log | null>;
  createLog: (log: LogCreate) => Promise<Log | null>;
  updateLog: (id: number, updates: LogUpdate) => Promise<Log | null>;
  deleteLog: (id: number) => Promise<boolean>;

  // Utility methods
  getLogsBySadLetter: (isSadLetter: boolean) => Log[];
  getLogsByMissLetter: (isMissLetter: boolean) => Log[];
  getSadLetterLogs: () => Log[];
  getMissLetterLogs: () => Log[];
  getTodaysLogs: () => Log[];
  getLogsByDateRange: (startDate: string, endDate: string) => Log[];
  clearError: () => void;
  reset: () => void;
}

const useLogsStore = create<LogsState>((set, get) => ({
  // Initial state
  logs: [],
  currentLog: null,
  isLoading: false,
  error: null,

  // Basic setters
  setLogs: (logs) => set({ logs }),
  setCurrentLog: (log) => set({ currentLog: log }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // CRUD Operations
  fetchLogs: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        logs: data || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching logs from Supabase:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
        isLoading: false 
      });
    }
  },

  fetchLogById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const log = data as Log;
      set({ 
        currentLog: log,
        isLoading: false 
      });
      
      return log;
    } catch (error) {
      console.error('Error fetching log by ID:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch log',
        isLoading: false,
        currentLog: null
      });
      return null;
    }
  },

  createLog: async (logData: LogCreate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('logs')
        .insert([logData])
        .select()
        .single();

      if (error) throw error;

      const newLog = data as Log;
      
      // Add to local state
      const { logs } = get();
      set({ 
        logs: [newLog, ...logs],
        isLoading: false 
      });
      
      return newLog;
    } catch (error) {
      console.error('Error creating log:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create log',
        isLoading: false 
      });
      return null;
    }
  },

  updateLog: async (id: number, updates: LogUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedLog = data as Log;
      
      // Update local state
      const { logs } = get();
      const updatedLogs = logs.map(log => 
        log.id === id ? updatedLog : log
      );
      
      set({ 
        logs: updatedLogs,
        currentLog: updatedLog,
        isLoading: false 
      });
      
      return updatedLog;
    } catch (error) {
      console.error('Error updating log:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update log',
        isLoading: false 
      });
      return null;
    }
  },

  deleteLog: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from local state
      const { logs, currentLog } = get();
      const filteredLogs = logs.filter(log => log.id !== id);
      
      set({ 
        logs: filteredLogs,
        currentLog: currentLog?.id === id ? null : currentLog,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting log:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete log',
        isLoading: false 
      });
      return false;
    }
  },

  // Utility methods
  getLogsBySadLetter: (isSadLetter: boolean) => {
    const { logs } = get();
    return logs.filter(log => log.is_sad_letter === isSadLetter);
  },

  getLogsByMissLetter: (isMissLetter: boolean) => {
    const { logs } = get();
    return logs.filter(log => log.is_miss_letter === isMissLetter);
  },

  getSadLetterLogs: () => {
    const { logs } = get();
    return logs.filter(log => log.is_sad_letter === true);
  },

  getMissLetterLogs: () => {
    const { logs } = get();
    return logs.filter(log => log.is_miss_letter === true);
  },

  getTodaysLogs: () => {
    const { logs } = get();
    const today = new Date().toISOString().split('T')[0];
    return logs.filter(log => {
      if (!log.created_at) return false;
      const logDate = new Date(log.created_at).toISOString().split('T')[0];
      return logDate === today;
    });
  },

  getLogsByDateRange: (startDate: string, endDate: string) => {
    const { logs } = get();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return logs.filter(log => {
      if (!log.created_at) return false;
      const logDate = new Date(log.created_at);
      return logDate >= start && logDate <= end;
    });
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    logs: [],
    currentLog: null,
    isLoading: false,
    error: null,
  }),
}));

export default useLogsStore;