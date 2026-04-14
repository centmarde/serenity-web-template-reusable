import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import * as geolocator from 'geolocator';

// Device detection utility
export const detectDevice = (): string => {
  if (typeof window === 'undefined') return 'Server';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|kindle|silk/i.test(userAgent);
  
  // Get screen size info
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Detect specific devices
  if (userAgent.includes('iphone')) {
    return `iPhone (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
  }
  if (userAgent.includes('ipad')) {
    return `iPad (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
  }
  if (userAgent.includes('android')) {
    if (isMobile) {
      return `Android Mobile (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
    }
    return `Android Tablet (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
  }
  
  // Desktop browsers
  if (userAgent.includes('chrome')) {
    return `Desktop Chrome (${screenWidth}x${screenHeight})`;
  }
  if (userAgent.includes('firefox')) {
    return `Desktop Firefox (${screenWidth}x${screenHeight})`;
  }
  if (userAgent.includes('safari')) {
    return `Desktop Safari (${screenWidth}x${screenHeight})`;
  }
  if (userAgent.includes('edge')) {
    return `Desktop Edge (${screenWidth}x${screenHeight})`;
  }
  
  // Fallback based on screen size
  if (isTablet) {
    return `Tablet (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
  }
  if (isMobile) {
    return `Mobile (${screenWidth}x${screenHeight}, ${devicePixelRatio}x)`;
  }
  
  return `Desktop (${screenWidth}x${screenHeight})`;
};

// IP-based geolocation fallback
const getIPLocation = async (): Promise<string> => {
  try {
    // Using ipapi.co (free tier: 30k requests/month)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('IP location service unavailable');
    
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      const city = data.city || 'Unknown';
      const region = data.region || 'Unknown';
      const country = data.country_name || 'Unknown';
      return `${city}, ${region}, ${country} (IP-based: ${data.latitude}, ${data.longitude})`;
    }
    
    return 'IP location unavailable';
  } catch (error) {
    console.warn('IP geolocation failed:', error);
    return 'IP location failed';
  }
};

// Timezone-based location estimation
const getTimezoneLocation = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || 'en-US';
    
    // Get approximate region from timezone
    const timezoneCity = timezone.split('/').pop()?.replace(/_/g, ' ') || 'Unknown';
    
    return `${timezoneCity} (Timezone: ${timezone}, Locale: ${locale})`;
  } catch (error) {
    console.warn('Timezone detection failed:', error instanceof Error ? error.message : String(error));
    return 'Timezone detection failed';
  }
};

// Enhanced location detection with geolocator and fallback methods
export const detectLocation = async (): Promise<string> => {
  // Method 1: Try Geolocator (most accurate with additional features)
  try {
    if (typeof window !== 'undefined') {
      // Configure geolocator options
      geolocator.config({
        language: 'en',
        google: {
          version: '3',
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
        }
      });

      const gpsLocation = await new Promise<string>((resolve, reject) => {
        const options = {
          enableHighAccuracy: true,  // Use GPS on mobile devices
          timeout: 10000,            // 10 second timeout
          maximumAge: 300000,        // 5 minutes cache
          desiredAccuracy: 10,       // Desired accuracy in meters
          fallbackToIP: false        // We'll handle IP fallback separately
        };

        geolocator.locate(options, (err, location) => {
          if (err) {
            console.warn('Geolocator failed:', err.message);
            reject(err);
            return;
          }

          if (location && location.coords) {
            const { latitude, longitude, accuracy } = location.coords;
            let locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Geolocator ±${Math.round(accuracy || 0)}m)`;
            
            // Add address info if available
            if (location.address) {
              const addr = location.address;
              const addressParts = [];
              if (addr.city) addressParts.push(addr.city);
              if (addr.state) addressParts.push(addr.state);
              if (addr.country) addressParts.push(addr.country);
              
              if (addressParts.length > 0) {
                locationString = `${addressParts.join(', ')} (${latitude.toFixed(6)}, ${longitude.toFixed(6)}, ±${Math.round(accuracy || 0)}m)`;
              }
            }
            
            resolve(locationString);
          } else {
            reject(new Error('No location data received'));
          }
        });
      });
      
      return gpsLocation;
    }
  } catch (gpsError) {
    console.log('Geolocator failed, trying IP location...', gpsError instanceof Error ? gpsError.message : String(gpsError));
  }

  // Method 2: Try IP-based geolocation (fallback)
  try {
    const ipLocation = await getIPLocation();
    if (!ipLocation.includes('failed') && !ipLocation.includes('unavailable')) {
      return ipLocation;
    }
  } catch (ipError) {
    console.log('IP location failed, trying timezone...', ipError instanceof Error ? ipError.message : String(ipError));
  }

  // Method 3: Use timezone and locale as last resort
  try {
    const timezoneLocation = getTimezoneLocation();
    if (!timezoneLocation.includes('failed')) {
      return timezoneLocation;
    }
  } catch (timezoneError) {
    console.log('Timezone detection failed:', timezoneError instanceof Error ? timezoneError.message : String(timezoneError));
  }

  // Method 4: Final fallback - basic browser info
  if (typeof window !== 'undefined') {
   /*  const userAgent = navigator.userAgent.toLowerCase(); */
    const language = navigator.language || 'Unknown';
    const platform = navigator.platform || 'Unknown';
    
    return `Platform: ${platform}, Language: ${language} (Location services unavailable)`;
  }

  return 'Location detection unavailable';
};

// Auto-detect device and location for log creation
export const createLogWithDeviceAndLocation = async (logData: Omit<LogCreate, 'device' | 'address'>): Promise<LogCreate> => {
  const device = detectDevice();
  
  console.log('🔍 Starting location detection...');
  const address = await detectLocation();
  console.log('📍 Location detected:', address);
  
  return {
    ...logData,
    device,
    address
  };
};

// Quick location detection without GPS (for faster results)
export const createLogWithDeviceAndQuickLocation = async (logData: Omit<LogCreate, 'device' | 'address'>): Promise<LogCreate> => {
  const device = detectDevice();
  
  // Skip Geolocator GPS, use faster methods only
  let address: string;
  try {
    // Try geolocator IP-based location first (faster than GPS)
    geolocator.config({
      language: 'en',
      google: { 
        version: '3', 
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
      }
    });
    
    const ipLocation = await new Promise<string>((resolve) => {
      geolocator.locateByIP((err, location) => {
        if (err || !location) {
          resolve('Geolocator IP failed');
          return;
        }
        
        const city = location.city || 'Unknown';
        const region = location.region?.name || location.state || 'Unknown';
        const country = location.country?.name || 'Unknown';
        const coords = location.coords ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'N/A';
        
        resolve(`${city}, ${region}, ${country} (Geolocator IP: ${coords})`);
      });
    });
    
    address = ipLocation.includes('failed') ? getTimezoneLocation() : ipLocation;
  } catch (error) {
    // Fallback to our custom IP method
    try {
      const fallbackIP = await getIPLocation();
      address = fallbackIP.includes('failed') ? getTimezoneLocation() : fallbackIP;
    } catch {
      address = getTimezoneLocation();
    }
    console.log('Quick location detection fallback:', error instanceof Error ? error.message : String(error));
  }
  
  return {
    ...logData,
    device,
    address
  };
};

// Legacy function for backward compatibility
export const createLogWithDevice = (logData: Omit<LogCreate, 'device'>): LogCreate => {
  return {
    ...logData,
    device: detectDevice()
  };
};

// Types
export interface Log {
  id?: number;
  created_at?: string;
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
  device?: string | null;
  address?: string | null;
}

export interface LogCreate {
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
  device?: string | null;
  address?: string | null;
}

export interface LogUpdate {
  is_sad_letter?: boolean | null;
  is_miss_letter?: boolean | null;
  device?: string | null;
  address?: string | null;
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
  getLogsByDevice: (device: string) => Log[];
  getLogsByAddress: (address: string) => Log[];
  getUniqueDevices: () => string[];
  getUniqueAddresses: () => string[];
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

  getLogsByDevice: (device: string) => {
    const { logs } = get();
    return logs.filter(log => log.device === device);
  },

  getUniqueDevices: () => {
    const { logs } = get();
    const devices = logs
      .map(log => log.device)
      .filter((device, index, arr) => device && arr.indexOf(device) === index) as string[];
    return devices;
  },

  getLogsByAddress: (address: string) => {
    const { logs } = get();
    return logs.filter(log => log.address === address);
  },

  getUniqueAddresses: () => {
    const { logs } = get();
    const addresses = logs
      .map(log => log.address)
      .filter((address, index, arr) => address && arr.indexOf(address) === index) as string[];
    return addresses;
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