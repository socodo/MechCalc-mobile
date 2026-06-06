import { apiClient } from "./client";
import type { MotorCatalogResponse } from "./motor-catalog.service";

export interface KinematicRow {
  power: number;
  ratio: number;
  speed: number;
  torque: number;
}

export interface KinematicTable {
  motor: KinematicRow;
  shaft1: KinematicRow;
  shaft2: KinematicRow;
  shaft3: KinematicRow;
  workingShaft: KinematicRow;
}

export interface MotorCalculationRequest {
  id?: string;
  pWorking: number;
  pRequired: number;
  nWorking: number;
  nPreliminary: number;
  etaTotal: number;
  unt: number;
  u1: number;
  u2: number;
  ux: number;
  uTotalReal: number;
  uHReal: number;
  selectedMotorId: number;
  kinematicTable: KinematicTable;
}

export interface MotorCalculationResponse extends MotorCalculationRequest {
  projectId: string;
  selectedMotor: MotorCatalogResponse;
  updatedAt: string;
}

export const motorCalculationService = {
  async get(projectId: string): Promise<MotorCalculationResponse> {
    const { data } = await apiClient.get(`/projects/${projectId}/motor-calculation`);
    return data.data;
  },

  async save(projectId: string, payload: MotorCalculationRequest): Promise<void> {
    await apiClient.post(`/projects/${projectId}/motor-calculation`, payload);
  },

  async update(projectId: string, payload: MotorCalculationRequest): Promise<void> {
    await apiClient.put(`/projects/${projectId}/motor-calculation`, payload);
  },

  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/motor-calculation`);
  },
};
