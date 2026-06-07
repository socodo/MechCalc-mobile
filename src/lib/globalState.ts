export type GearSummary = {
  z1: number;
  z2: number;
  u_actual: number;
  Re: number;
  b: number;
  dm1: number;
  dm2: number;
  sigma_H: number;
  allowable_sigma_H: number;
  isContactValid: boolean;
  isBending1Valid: boolean;
  isBending2Valid: boolean;
};

export type ChainSummary = {
  p_c: number;
  z1: number;
  z2: number;
  d1: number;
  d2: number;
  a: number;
  X: number;
  isPcValid: boolean;
  isStrengthValid: boolean;
  isImpactValid: boolean;
};

export type FullGearState = {
  result: any; // BevelGearResult
  inputTI: number;
  inputNI: number;
  inputU1: number;
  inputLh: number;
};

export type FullChainState = {
  result: any; // ChainDriveResult
  inputP: number;
  inputN: number;
  inputU: number;
};

export const globalNavigationState = {
  scrollToPrint: false,
  motorScreenState: null as {
    powerKw: string;
    nlvRpm: string;
    isShow: boolean;
    snapshot: any;
    calcError: string | null;
  } | null,
  gearResult: null as GearSummary | null,
  chainResult: null as ChainSummary | null,
  fullGearState: null as FullGearState | null,
  fullChainState: null as FullChainState | null,
};
