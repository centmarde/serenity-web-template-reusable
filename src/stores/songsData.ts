import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Base URL for song storage
export const SONGS_STORAGE_BASE_URL = 'https://rhuxiyqliygmogxcwltv.supabase.co/storage/v1/object/public/songs/';

export interface Song {
  id: number;
  created_at: string;
  title: string | null;
  description: string | null;
  is_girlfriend: boolean | null;
  audio_src: string | null;
}

// Utility functions for song URL handling
export const getSongFullUrl = (audioSrc: string | null): string | null => {
  if (!audioSrc) return null;
  
  // If it's already a full URL, return as is
  if (audioSrc.startsWith('http://') || audioSrc.startsWith('https://')) {
    return audioSrc;
  }
  
  // If it's a relative path, prepend the base URL
  return `${SONGS_STORAGE_BASE_URL}${audioSrc}`;
};

export const getStoragePath = (filename: string): string => {
  // Remove any leading slashes and ensure clean path
  const cleanFilename = filename.replace(/^\/+/, '');
  return cleanFilename;
};

export interface SongsStore {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  fetchSongs: () => Promise<void>;
  getSongById: (id: number) => Song | undefined;
  getGirlfriendSongs: () => Song[];
  getBoyfriendSongs: () => Song[];
  addSong: (song: Omit<Song, 'id' | 'created_at'>) => Promise<Song | null>;
  addSongWithFile: (songData: Omit<Song, 'id' | 'created_at' | 'audio_src'>, audioFile: File) => Promise<Song | null>;
  updateSong: (id: number, updates: Partial<Omit<Song, 'id' | 'created_at'>>) => Promise<Song | null>;
  deleteSong: (id: number) => Promise<boolean>;
  uploadSongFile: (file: File) => Promise<string | null>;
  deleteSongFile: (audioSrc: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useSongsStore = create<SongsStore>((set, get) => ({
  songs: [],
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchSongs: async () => {
    const { isLoading } = get();
    
    // Prevent multiple simultaneous fetch requests
    if (isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      set({ 
        songs: data || [],
        isLoading: false,
        error: null,
        isInitialized: true
      });
    } catch (error) {
      console.error('Error fetching songs:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch songs',
        isInitialized: true
      });
    }
  },

  getSongById: (id: number) => {
    const { songs } = get();
    return songs.find(song => song.id === id);
  },

  getGirlfriendSongs: () => {
    const { songs } = get();
    return songs.filter(song => song.is_girlfriend === true);
  },

  getBoyfriendSongs: () => {
    const { songs } = get();
    // null is treated as boyfriend song (not explicitly marked as girlfriend)
    return songs.filter(song => song.is_girlfriend === false || song.is_girlfriend === null);
  },

  addSong: async (songData) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state with new song
      const { songs } = get();
      set({ 
        songs: [data, ...songs],
        isLoading: false,
        error: null
      });

      return data;
    } catch (error) {
      console.error('Error adding song:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add song'
      });
      return null;
    }
  },

  addSongWithFile: async (songData, audioFile) => {
    set({ isLoading: true, error: null });

    try {
      // First upload the file
      const { uploadSongFile } = get();
      const audioSrc = await uploadSongFile(audioFile);
      
      if (!audioSrc) {
        throw new Error('Failed to upload audio file');
      }

      // Then create the song record with the uploaded file path
      const songWithFile = { ...songData, audio_src: audioSrc };
      const { data, error } = await supabase
        .from('songs')
        .insert([songWithFile])
        .select()
        .single();

      if (error) {
        // If song creation fails, try to clean up the uploaded file
        await get().deleteSongFile(audioSrc);
        throw error;
      }

      // Update local state with new song
      const { songs } = get();
      set({ 
        songs: [data, ...songs],
        isLoading: false,
        error: null
      });

      return data;
    } catch (error) {
      console.error('Error adding song with file:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add song with file'
      });
      return null;
    }
  },

  uploadSongFile: async (file) => {
    try {
      // Use the original filename directly
      const filename = file.name;
      const { data, error } = await supabase.storage
        .from('songs')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files with same name
        });

      if (error) {
        throw error;
      }

      return data.path;
    } catch (error) {
      console.error('Error uploading song file:', error);
      return null;
    }
  },

  deleteSongFile: async (audioSrc) => {
    try {
      // Extract the file path from the audio_src
      let filePath = audioSrc;
      if (audioSrc.startsWith(SONGS_STORAGE_BASE_URL)) {
        filePath = audioSrc.replace(SONGS_STORAGE_BASE_URL, '');
      }

      const { error } = await supabase.storage
        .from('songs')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting song file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting song file:', error);
      return false;
    }
  },

  updateSong: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('songs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      const { songs } = get();
      const updatedSongs = songs.map(song => 
        song.id === id ? { ...song, ...data } : song
      );
      
      set({ 
        songs: updatedSongs,
        isLoading: false,
        error: null
      });

      return data;
    } catch (error) {
      console.error('Error updating song:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update song'
      });
      return null;
    }
  },

  deleteSong: async (id) => {
    set({ isLoading: true, error: null });

    try {
      // Get the song first to access the audio file path
      const { songs, deleteSongFile } = get();
      const songToDelete = songs.find(song => song.id === id);

      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Try to delete the associated audio file (don't fail if file deletion fails)
      if (songToDelete?.audio_src) {
        await deleteSongFile(songToDelete.audio_src);
      }

      // Update local state
      const filteredSongs = songs.filter(song => song.id !== id);
      
      set({ 
        songs: filteredSongs,
        isLoading: false,
        error: null
      });

      return true;
    } catch (error) {
      console.error('Error deleting song:', error);
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete song'
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      songs: [],
      isLoading: false,
      error: null,
      isInitialized: false
    });
  }
}));

// Helper functions for easier usage
export const useSongsActions = () => {
  const { 
    fetchSongs, 
    addSong,
    addSongWithFile,
    updateSong, 
    deleteSong,
    uploadSongFile,
    deleteSongFile, 
    clearError, 
    reset 
  } = useSongsStore();
  
  return {
    fetchSongs,
    addSong,
    addSongWithFile,
    updateSong,
    deleteSong,
    uploadSongFile,
    deleteSongFile,
    clearError,
    reset
  };
};

export const useSongsSelectors = () => {
  const { 
    songs, 
    isLoading, 
    error, 
    isInitialized,
    getSongById,
    getGirlfriendSongs,
    getBoyfriendSongs
  } = useSongsStore();
  
  // Enhanced selectors with full URLs
  const getSongsWithFullUrls = (): (Song & { fullAudioUrl: string | null })[] => {
    return songs.map(song => ({
      ...song,
      fullAudioUrl: getSongFullUrl(song.audio_src)
    }));
  };

  const getGirlfriendSongsWithUrls = () => {
    return getGirlfriendSongs().map(song => ({
      ...song,
      fullAudioUrl: getSongFullUrl(song.audio_src)
    }));
  };

  const getBoyfriendSongsWithUrls = () => {
    return getBoyfriendSongs().map(song => ({
      ...song,
      fullAudioUrl: getSongFullUrl(song.audio_src)
    }));
  };
  
  return {
    songs,
    isLoading,
    error,
    isInitialized,
    getSongById,
    getGirlfriendSongs,
    getBoyfriendSongs,
    getSongsWithFullUrls,
    getGirlfriendSongsWithUrls,
    getBoyfriendSongsWithUrls
  };
};
