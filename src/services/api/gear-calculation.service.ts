import { apiClient } from "./client";

export interface GearCalculationRequest {
  id?: string;
  nI: number;
  nII: number;
  tI: number;
  tII: number;
  u1: number;
  u2: number;
  lifeHours: number;
  allowableSigmaH: number;
  allowableSigmaF: number;
  // Cấp nhanh (bánh răng côn)
  fastZ1: number;
  fastZ2: number;
  fastMte: number;
  fastMtm: number;
  fastMnm: number;
  fastRe: number;
  fastB: number;
  fastDm1: number;
  fastDm2: number;
  fastDelta1: number;
  fastDelta2: number;
  fastSigmaH: number;
  fastSigmaF1: number;
  fastSigmaF2: number;
  fastFt1: number;
  fastFr1: number;
  fastFa1: number;
  fastWarning: string | null;
}

export interface GearCalculationResponse extends GearCalculationRequest {
  projectId: string;
  updatedAt: string;
}

export const gearCalculationService = {
  async get(projectId: string): Promise<GearCalculationResponse> {
    const { data } = await apiClient.get(`/projects/${projectId}/gear-calculation`);
    return data.data;
  },

  async save(projectId: string, payload: GearCalculationRequest): Promise<void> {
    await apiClient.post(`/projects/${projectId}/gear-calculation`, payload);
  },

  async update(projectId: string, payload: GearCalculationRequest): Promise<void> {
    await apiClient.put(`/projects/${projectId}/gear-calculation`, payload);
  },

  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/gear-calculation`);
  },
};
