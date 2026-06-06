import { apiClient } from "./client";

export interface ChainCalculationRequest {
  id?: string;
  p: number;
  n: number;
  u: number;
  k: number;
  z1: number;
  z2: number;
  n01: number;
  pt: number;
  allowablePower: number;
  pc: number;
  d0: number;
  b0: number;
  pcMax: number;
  d1: number;
  d2: number;
  da1: number;
  da2: number;
  asb: number;
  xsb: number;
  x: number;
  a: number;
  deltaA: number;
  chainLength: number;
}

export interface ChainCalculationResponse extends ChainCalculationRequest {
  projectId: string;
  updatedAt: string;
}

export const chainCalculationService = {
  async get(projectId: string): Promise<ChainCalculationResponse> {
    const { data } = await apiClient.get(`/projects/${projectId}/chain-calculation`);
    return data.data;
  },

  async save(projectId: string, payload: ChainCalculationRequest): Promise<void> {
    await apiClient.post(`/projects/${projectId}/chain-calculation`, payload);
  },

  async update(projectId: string, payload: ChainCalculationRequest): Promise<void> {
    await apiClient.put(`/projects/${projectId}/chain-calculation`, payload);
  },

  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/chain-calculation`);
  },
};
