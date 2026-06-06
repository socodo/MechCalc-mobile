import { apiClient } from "./client";

export interface MotorCatalogResponse {
  id: number;
  motorCode: string;
  series: string;
  power: number;
  speed: number;
  syncSpeed: number;
  poles: number;
  efficiency: number;
  cosPhi: number;
  tkTdnRatio: number;
  tmaxTdnRatio: number;
  inertia: number;
  weight: number;
}

export const motorCatalogService = {
  async getMotorCatalogs(): Promise<MotorCatalogResponse[]> {
    const { data } = await apiClient.get("/motor-catalogs");
    return data.data;
  },
};
