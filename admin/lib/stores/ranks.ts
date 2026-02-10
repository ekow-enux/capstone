"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const RANKS_ENDPOINT = `${API_BASE_URL}/fire/ranks`;

export interface Rank {
  _id: string;
  id: string;
  name?: string;
  initials?: string;
  level?: number;
  group?: 'junior' | 'senior';
  gender?: 'male' | 'female' | null;
  description?: string;
  personnelCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface RanksResponse {
  success: boolean;
  count?: number;
  data: Rank[];
}

export interface CreateRankData {
  name: string;
  initials: string;
  level?: number;
  group: 'junior' | 'senior';
  gender?: 'male' | 'female' | null;
  description: string;
}

interface CreateRankAPIData {
  name: string;
  initials: string;
  level: number;
  group: 'junior' | 'senior';
  gender: 'male' | 'female' | null;
  description: string;
}

interface RanksStore {
  ranks: Rank[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchRanks: () => Promise<void>;
  createRank: (data: CreateRankData) => Promise<Rank>;
  updateRank: (id: string, data: Partial<CreateRankData>) => Promise<Rank>;
  deleteRank: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch ranks
const apiFetchRanks = async (): Promise<RanksResponse> => {
  try {
    const { data } = await axios.get<RanksResponse | Rank[]>(
      RANKS_ENDPOINT,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(rank => ({
          ...rank,
          id: rank.id || rank._id,
          _id: rank._id || rank.id,
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(rank => ({
        ...rank,
        id: rank.id || rank._id,
        _id: rank._id || rank.id,
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch ranks"
      : "Failed to fetch ranks";
    throw new Error(message);
  }
};

// API function to create rank
const apiCreateRank = async (formData: CreateRankData): Promise<Rank> => {
  try {
    const apiData: CreateRankAPIData = {
      name: formData.name.trim(),
      initials: formData.initials.trim().toUpperCase(),
      level: formData.level ?? 0,
      group: formData.group,
      description: formData.description.trim(),
      gender: formData.group === 'junior' && formData.gender ? formData.gender : null,
    };

    const { data } = await axios.post<{ success: boolean; data: Rank } | Rank>(
      RANKS_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Rank
    const rank = 'data' in data ? data.data : data;
    return {
      ...rank,
      id: rank.id || rank._id,
      _id: rank._id || rank.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create rank"
      : "Failed to create rank";
    throw new Error(message);
  }
};

// API function to update rank
const apiUpdateRank = async (id: string, formData: Partial<CreateRankData>): Promise<Rank> => {
  try {
    const apiData: Partial<CreateRankAPIData> = {};
    if (formData.name) apiData.name = formData.name.trim();
    if (formData.initials) apiData.initials = formData.initials.trim().toUpperCase();
    if (formData.level !== undefined) apiData.level = formData.level;
    if (formData.group) apiData.group = formData.group;
    if (formData.description !== undefined) apiData.description = formData.description.trim();
    
    // Handle gender: only set if group is 'junior', otherwise set to null
    if (formData.group !== undefined) {
      if (formData.group === 'junior' && formData.gender) {
        apiData.gender = formData.gender;
      } else {
        apiData.gender = null;
      }
    } else if (formData.gender !== undefined) {
      // If group is not being updated but gender is, we need to check current rank's group
      // For now, just set it (backend should validate)
      apiData.gender = formData.gender;
    }

    const { data } = await axios.put<{ success: boolean; data: Rank } | Rank>(
      `${RANKS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Rank
    const rank = 'data' in data ? data.data : data;
    return {
      ...rank,
      id: rank.id || rank._id,
      _id: rank._id || rank.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update rank"
      : "Failed to update rank";
    throw new Error(message);
  }
};

// API function to delete rank
const apiDeleteRank = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${RANKS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete rank"
      : "Failed to delete rank";
    throw new Error(message);
  }
};

export const useRanksStore = create<RanksStore>()(
  persist(
    (set, get) => ({
      ranks: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchRanks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchRanks();
          set({
            ranks: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch ranks";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createRank: async (data: CreateRankData) => {
        set({ isLoading: true, error: null });
        try {
          const newRank = await apiCreateRank(data);
          set((state) => ({
            ranks: [...state.ranks, newRank],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newRank;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create rank";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateRank: async (id: string, data: Partial<CreateRankData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRank = await apiUpdateRank(id, data);
          set((state) => ({
            ranks: state.ranks.map((rank) =>
              (rank.id === id || rank._id === id) ? updatedRank : rank
            ),
            isLoading: false,
            error: null,
          }));
          return updatedRank;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update rank";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteRank: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteRank(id);
          set((state) => ({
            ranks: state.ranks.filter((rank) => rank.id !== id && rank._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete rank";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'gnfs-ranks-storage',
      partialize: (state) => ({
        ranks: state.ranks,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectRanks = (state: RanksStore) => state.ranks;
export const selectRanksIsLoading = (state: RanksStore) => state.isLoading;
export const selectRanksError = (state: RanksStore) => state.error;
export const selectRanksCount = (state: RanksStore) => state.count;



