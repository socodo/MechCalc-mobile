import { apiClient } from "./client";

export interface GearMaterialCatalogResponse {
  id: number;
  catalogCode: string;
  gearDetail: string;
  material: string;
  heatTreatment: string;
  sizeLimitMm: number;
  hardnessHb: number;
  sigmaB: number;
  sigmaCh: number;
  contactFatigueLimitCoefficient: number;
  contactFatigueLimitConstant: number;
  contactSafetyFactor: number;
  bendingFatigueLimitCoefficient: number;
  bendingSafetyFactor: number;
}

export const gearCatalogService = {
  async getGearMaterialCatalogs(): Promise<GearMaterialCatalogResponse[]> {
    const { data } = await apiClient.get("/gear-catalogs");
    return data.data;
  },
};
