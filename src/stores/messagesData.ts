import { create } from 'zustand';
import { supabase, STORAGE_BASE_URL } from '@/lib/supabase';

// Types
export interface LoveLetter {
  id?: number;
  created_at?: string;
  title?: string;
  message?: string;
  user_id?: string;
  category?: string;
  is_girlfriend?: boolean;
  attach_image?: string;
}

export interface LoveLetterCreate {
  title?: string;
  message?: string;
  category?: string;
  is_girlfriend?: boolean;
  attach_image?: string;
}

export interface LoveLetterUpdate {
  title?: string;
  message?: string;
  category?: string;
  is_girlfriend?: boolean;
  attach_image?: string;
}

interface MessagesState {
  // State
  letters: LoveLetter[];
  currentLetter: LoveLetter | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLetters: (letters: LoveLetter[]) => void;
  setCurrentLetter: (letter: LoveLetter | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD Operations
  fetchLetters: () => Promise<void>;
  fetchLetterById: (id: number) => Promise<LoveLetter | null>;
  createLetter: (letter: LoveLetterCreate) => Promise<LoveLetter | null>;
  updateLetter: (id: number, updates: LoveLetterUpdate) => Promise<LoveLetter | null>;
  deleteLetter: (id: number) => Promise<boolean>;

  // Utility methods
  getLettersByCategory: (category: string) => LoveLetter[];
  getLettersByGirlfriend: (isGirlfriend: boolean) => LoveLetter[];
  clearError: () => void;
  reset: () => void;

  // Image handling methods
  uploadImage: (file: File, fileName?: string) => Promise<{ url: string; path: string } | null>;
  deleteImage: (imagePath: string) => Promise<boolean>;
  updateImage: (oldImagePath: string, newFile: File, fileName?: string) => Promise<{ url: string; path: string } | null>;
  getImageUrl: (imagePath: string) => string;
  validateImage: (file: File) => { valid: boolean; error?: string };
}

const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  letters: [],
  currentLetter: null,
  isLoading: false,
  error: null,

  // Basic setters
  setLetters: (letters) => set({ letters }),
  setCurrentLetter: (letter) => set({ currentLetter: letter }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // CRUD Operations
  fetchLetters: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        letters: data || [], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching letters:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch letters',
        isLoading: false 
      });
    }
  },

  fetchLetterById: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ 
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching letter by ID:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch letter',
        isLoading: false 
      });
      return null;
    }
  },

  createLetter: async (letter: LoveLetterCreate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .insert([letter])
        .select()
        .single();

      if (error) throw error;

      // Add the new letter to the beginning of the list
      const { letters } = get();
      set({ 
        letters: [data, ...letters],
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error creating letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create letter',
        isLoading: false 
      });
      return null;
    }
  },

  updateLetter: async (id: number, updates: LoveLetterUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('love_letters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update the letter in the list
      const { letters } = get();
      const updatedLetters = letters.map(letter => 
        letter.id === id ? data : letter
      );
      
      set({ 
        letters: updatedLetters,
        currentLetter: data,
        isLoading: false 
      });
      
      return data;
    } catch (error) {
      console.error('Error updating letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update letter',
        isLoading: false 
      });
      return null;
    }
  },

  deleteLetter: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('love_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove the letter from the list
      const { letters } = get();
      const filteredLetters = letters.filter(letter => letter.id !== id);
      
      set({ 
        letters: filteredLetters,
        currentLetter: null,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting letter:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete letter',
        isLoading: false 
      });
      return false;
    }
  },

  // Utility methods
  getLettersByCategory: (category: string) => {
    const { letters } = get();
    return letters.filter(letter => letter.category === category);
  },

  getLettersByGirlfriend: (isGirlfriend: boolean) => {
    const { letters } = get();
    return letters.filter(letter => letter.is_girlfriend === isGirlfriend);
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    letters: [],
    currentLetter: null,
    isLoading: false,
    error: null
  }),

  // Image handling methods
  uploadImage: async (file: File, fileName?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `marde/${uniqueFileName}`;

      const { error } = await supabase.storage
        .from('messages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        set({ 
          error: error.message,
          isLoading: false 
        });
        return null;
      }

      const result = {
        url: `${STORAGE_BASE_URL}messages/${filePath}`,
        path: uniqueFileName
      };

      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to upload image',
        isLoading: false 
      });
      return null;
    }
  },

  deleteImage: async (imagePath: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Extract just the filename if it's a full URL
      const messagesBaseUrl = `${STORAGE_BASE_URL}messages/`;
      const fileName = imagePath.includes(messagesBaseUrl) 
        ? imagePath.split(messagesBaseUrl)[1]
        : imagePath;

      const filePath = fileName.startsWith('marde/') 
        ? fileName 
        : `marde/${fileName}`;

      const { error } = await supabase.storage
        .from('messages')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        set({ 
          error: error.message,
          isLoading: false 
        });
        return false;
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete image',
        isLoading: false 
      });
      return false;
    }
  },

  updateImage: async (oldImagePath: string, newFile: File, fileName?: string) => {
    const { uploadImage, deleteImage } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Delete old image if it exists
      if (oldImagePath) {
        await deleteImage(oldImagePath);
      }

      // Upload new image
      const result = await uploadImage(newFile, fileName);
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Error updating image:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update image',
        isLoading: false 
      });
      return null;
    }
  },

  getImageUrl: (imagePath: string) => {
    if (!imagePath) return '';
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the messages base URL
    return `${STORAGE_BASE_URL}messages/marde/${imagePath}`;
  },

  validateImage: (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Please upload images smaller than 5MB.' };
    }

    return { valid: true };
  }
}));

export default useMessagesStore;