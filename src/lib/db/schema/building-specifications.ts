import type { ProjectTypeCode } from "./project-types";

/** Fire/life-safety tier per Thai Building Control Act (อาคารสูง / อาคารสาธารณะ). */
export type FireSafetyComplianceLevel =
  | "basic"
  | "type_a"
  | "type_b"
  | "high_rise"
  | "public_assembly";

export interface BuildingSpecifications {
  id?: string;
  projectId?: string;
  projectTypeCode: ProjectTypeCode;

  /** Total above-ground floors (supports high-rise). */
  numberOfFloors: number;
  /** Below-grade floor count. */
  basementFloors: number;
  /** Gross floor area (usable + common), sqm. */
  grossFloorAreaSqm: number;
  /** Design live load kN/m² — warehouse/commercial critical. */
  loadBearingCapacityKnSqm: number;
  /** Passenger + service elevators. */
  elevatorCount: number;
  fireSafetyComplianceLevel: FireSafetyComplianceLevel;
  /** Required/offered parking bays. */
  parkingSpaces: number;
  /** Primary structural system key. */
  structuralSystem: string;
  /** Floor-to-floor height m (typical). */
  floorToFloorHeightM: number;
  /** Total building height m (above grade). */
  buildingHeightM: number;

  /** Residential-only optional fields */
  bedrooms?: number;
  bathrooms?: number;

  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_STRUCTURAL_SYSTEMS: Record<ProjectTypeCode, string> = {
  residential: "rc_frame",
  commercial: "rc_frame",
  warehouse: "steel_frame",
  high_rise: "rc_core_wall",
};

export const DEFAULT_LOAD_CAPACITY: Record<ProjectTypeCode, number> = {
  residential: 2.0,
  commercial: 3.5,
  warehouse: 5.0,
  high_rise: 4.0,
};

export const DEFAULT_FIRE_SAFETY: Record<ProjectTypeCode, FireSafetyComplianceLevel> = {
  residential: "basic",
  commercial: "type_a",
  warehouse: "type_b",
  high_rise: "high_rise",
};
