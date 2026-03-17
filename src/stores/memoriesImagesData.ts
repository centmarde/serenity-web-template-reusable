import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Types based on memory_images table schema
export interface MemoryImage {
  id: number;
  created_at: string;
  image_src: string | null;
  memories_id: number | null;
}

export interface CreateMemoryImageInput {
  image_src: string;
  memories_id?: number;
}

export interface UpdateMemoryImageInput {
  id: number;
  image_src?: string;
  memories_id?: number;
}

interface MemoryImagesStore {
  images: MemoryImage[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  fetchImages: () => Promise<void>;
  createImage: (input: CreateMemoryImageInput) => Promise<MemoryImage>;
  updateImage: (input: UpdateMemoryImageInput) => Promise<MemoryImage>;
  deleteImage: (id: number) => Promise<void>;
  getImageById: (id: number) => MemoryImage | undefined;
  uploadImage: (file: File, memoryId?: number) => Promise<MemoryImage>;
  linkImageToMemory: (imageId: number, memoryId: number) => Promise<MemoryImage>;
  unlinkImageFromMemory: (imageId: number) => Promise<MemoryImage>;
  getImagesByMemory: (memoryId: number) => MemoryImage[];
  clearError: () => void;
  reset: () => void;
}



export const useMemoryImagesStore = create<MemoryImagesStore>((set, get) => ({
  images: [],
  loading: false,
  error: null,
  isInitialized: false,

  fetchImages: async () => {
    const { isInitialized, loading } = get();
    
    if (isInitialized || loading) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_images')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      set({ 
        images: data || [], 
        loading: false, 
        isInitialized: true,
        error: null 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch images';
      set({ 
        loading: false, 
        error: errorMessage,
        isInitialized: false 
      });
      throw new Error(errorMessage);
    }
  },

  createImage: async (input: CreateMemoryImageInput) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_images')
        .insert([{ 
          image_src: input.image_src,
          memories_id: input.memories_id 
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from create operation');
      }

      set(state => ({
        images: [...state.images, data],
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create image';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateImage: async (input: UpdateMemoryImageInput) => {
    set({ loading: true, error: null });

    try {
      const updateData: Partial<Pick<MemoryImage, 'image_src' | 'memories_id'>> = {};
      if (input.image_src !== undefined) {
        updateData.image_src = input.image_src;
      }
      if (input.memories_id !== undefined) {
        updateData.memories_id = input.memories_id;
      }

      const { data, error } = await supabase
        .from('memory_images')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      set(state => ({
        images: state.images.map(img => img.id === input.id ? data : img),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update image';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteImage: async (id: number) => {
    set({ loading: true, error: null });

    try {
      // First, get the image data to extract the file path from the URL
      const imageToDelete = get().images.find(img => img.id === id);
      
      if (!imageToDelete) {
        throw new Error('Image not found');
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from('memory_images')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      // Extract file path from the public URL and delete from storage
      if (imageToDelete.image_src) {
        try {
          // Extract the file path from the public URL
          // URL format: https://[project].supabase.co/storage/v1/object/public/memories/memory-images/[filename]
          const url = new URL(imageToDelete.image_src);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.indexOf('memories');
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            // Get the file path after the bucket name
            const filePath = pathParts.slice(bucketIndex + 1).join('/');
            
            // Delete from Supabase Storage
            const { error: storageError } = await supabase.storage
              .from('memories')
              .remove([filePath]);
            
            if (storageError) {
              console.warn('Failed to delete file from storage:', storageError.message);
              // Don't throw here - the database record is already deleted
              // This prevents the deletion from failing if storage cleanup fails
            }
          }
        } catch (storageError) {
          console.warn('Failed to parse URL or delete from storage:', storageError);
          // Continue - database deletion was successful
        }
      }

      set(state => ({
        images: state.images.filter(img => img.id !== id),
        loading: false,
        error: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  uploadImage: async (file: File, memoryId?: number) => {
    set({ loading: true, error: null });

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `memory-images/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath);

      // Save image reference to database with optional memory link
      const { data, error } = await supabase
        .from('memory_images')
        .insert([{ 
          image_src: publicUrl,
          memories_id: memoryId || null // Link directly if memoryId provided
        }])
        .select()
        .single();

      if (error) {
        // If database insert fails, try to clean up uploaded file
        await supabase.storage
          .from('memories')
          .remove([filePath]);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from create operation');
      }

      set(state => ({
        images: [...state.images, data],
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getImageById: (id: number) => {
    return get().images.find(img => img.id === id);
  },

  linkImageToMemory: async (imageId: number, memoryId: number) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_images')
        .update({ memories_id: memoryId })
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from link operation');
      }

      set(state => ({
        images: state.images.map(img => img.id === imageId ? data : img),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to link image to memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  unlinkImageFromMemory: async (imageId: number) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('memory_images')
        .update({ memories_id: null })
        .eq('id', imageId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from unlink operation');
      }

      set(state => ({
        images: state.images.map(img => img.id === imageId ? data : img),
        loading: false,
        error: null,
      }));

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlink image from memory';
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  getImagesByMemory: (memoryId: number) => {
    return get().images.filter(img => img.memories_id === memoryId);
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      images: [],
      loading: false,
      error: null,
      isInitialized: false,
    });
  },
}));
