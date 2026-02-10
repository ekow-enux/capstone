"use client";

import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const DEPARTMENTS_ENDPOINT = `${API_BASE_URL}/fire/departments`;

export interface Department {
  _id: string;
  id: string;
  name?: string;
  description?: string;
  stationId?: string | { _id?: string; id?: string };
  station_id?: string | { _id?: string; id?: string }; // Backend field name
  head?: string;
  headEmail?: string;
  headPhone?: string;
  personnelCount?: number;
  unitCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  units?: Array<{ _id?: string; id?: string; name?: string; [key: string]: unknown }>;
}

export interface DepartmentsResponse {
  success: boolean;
  count?: number;
  data: Department[];
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  stationId?: string;
  head?: string;
  headEmail?: string;
  headPhone?: string;
}

interface CreateDepartmentAPIData {
  name: string;
  description?: string;
  station_id?: string;
  head?: string;
  headEmail?: string;
  headPhone?: string;
}

interface DepartmentsStore {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  count: number;
  fetchDepartments: (stationId?: string) => Promise<void>;
  createDepartment: (data: CreateDepartmentData) => Promise<Department>;
  updateDepartment: (id: string, data: Partial<CreateDepartmentData>) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<void>;
  clearError: () => void;
}

// API function to fetch departments
const apiFetchDepartments = async (stationId?: string): Promise<DepartmentsResponse> => {
  try {
    const url = stationId 
      ? `${DEPARTMENTS_ENDPOINT}?stationId=${stationId}`
      : DEPARTMENTS_ENDPOINT;
    
    const { data } = await axios.get<DepartmentsResponse | Department[]>(
      url,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct array
    if (Array.isArray(data)) {
      return {
        success: true,
        count: data.length,
        data: data.map(dept => ({
          ...dept,
          id: dept.id || dept._id,
          _id: dept._id || dept.id,
          stationId: dept.stationId || dept.station_id, // Normalize station_id to stationId
        })),
      };
    }
    
    return {
      success: data.success ?? true,
      count: data.count ?? data.data?.length ?? 0,
      data: (data.data || []).map(dept => ({
        ...dept,
        id: dept.id || dept._id,
        _id: dept._id || dept.id,
        stationId: dept.stationId || dept.station_id, // Normalize station_id to stationId
      })),
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to fetch departments"
      : "Failed to fetch departments";
    throw new Error(message);
  }
};

// API function to create department
const apiCreateDepartment = async (formData: CreateDepartmentData): Promise<Department> => {
  try {
    // Map stationId to station_id for backend
    const apiData: CreateDepartmentAPIData = {
      name: formData.name,
      description: formData.description,
    };
    if (formData.stationId) {
      apiData.station_id = formData.stationId;
    }
    if (formData.head) apiData.head = formData.head;
    if (formData.headEmail) apiData.headEmail = formData.headEmail;
    if (formData.headPhone) apiData.headPhone = formData.headPhone;

    const { data } = await axios.post<{ success: boolean; data: Department } | Department>(
      DEPARTMENTS_ENDPOINT,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Department
    const department = 'data' in data ? data.data : data;
    return {
      ...department,
      id: department.id || department._id,
      _id: department._id || department.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to create department"
      : "Failed to create department";
    throw new Error(message);
  }
};

// API function to update department
const apiUpdateDepartment = async (id: string, formData: Partial<CreateDepartmentData>): Promise<Department> => {
  try {
    // Map stationId to station_id for backend
    const apiData: Partial<CreateDepartmentAPIData> = {};
    if (formData.name) apiData.name = formData.name;
    if (formData.description !== undefined) apiData.description = formData.description;
    if (formData.stationId) {
      apiData.station_id = formData.stationId;
    }
    if (formData.head !== undefined) apiData.head = formData.head;
    if (formData.headEmail !== undefined) apiData.headEmail = formData.headEmail;
    if (formData.headPhone !== undefined) apiData.headPhone = formData.headPhone;

    const { data } = await axios.put<{ success: boolean; data: Department } | Department>(
      `${DEPARTMENTS_ENDPOINT}/${id}`,
      apiData,
      { withCredentials: true }
    );
    
    // Handle both response formats: { success, data } or direct Department
    const department = 'data' in data ? data.data : data;
    return {
      ...department,
      id: department.id || department._id,
      _id: department._id || department.id,
    };
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to update department"
      : "Failed to update department";
    throw new Error(message);
  }
};

// API function to delete department
const apiDeleteDepartment = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${DEPARTMENTS_ENDPOINT}/${id}`,
      { withCredentials: true }
    );
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message || "Failed to delete department"
      : "Failed to delete department";
    throw new Error(message);
  }
};

export const useDepartmentsStore = create<DepartmentsStore>()(
  persist(
    (set, get) => ({
      departments: [],
      isLoading: false,
      error: null,
      count: 0,

      fetchDepartments: async (stationId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiFetchDepartments(stationId);
          set({
            departments: response.data,
            count: response.count || 0,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch departments";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createDepartment: async (data: CreateDepartmentData) => {
        set({ isLoading: true, error: null });
        try {
          const newDepartment = await apiCreateDepartment(data);
          set((state) => ({
            departments: [...state.departments, newDepartment],
            count: state.count + 1,
            isLoading: false,
            error: null,
          }));
          return newDepartment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create department";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      updateDepartment: async (id: string, data: Partial<CreateDepartmentData>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedDepartment = await apiUpdateDepartment(id, data);
          set((state) => ({
            departments: state.departments.map((dept) =>
              (dept.id === id || dept._id === id) ? updatedDepartment : dept
            ),
            isLoading: false,
            error: null,
          }));
          return updatedDepartment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update department";
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      deleteDepartment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiDeleteDepartment(id);
          set((state) => ({
            departments: state.departments.filter((dept) => dept.id !== id && dept._id !== id),
            count: Math.max(0, state.count - 1),
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete department";
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
      name: 'gnfs-departments-storage',
      partialize: (state) => ({
        departments: state.departments,
        count: state.count,
      }),
    }
  )
);

// Selectors
export const selectDepartments = (state: DepartmentsStore) => state.departments;
export const selectDepartmentsIsLoading = (state: DepartmentsStore) => state.isLoading;
export const selectDepartmentsError = (state: DepartmentsStore) => state.error;
export const selectDepartmentsCount = (state: DepartmentsStore) => state.count;

