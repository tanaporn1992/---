export type WaterType = 'unit' | 'flat_per_person';

export interface BuildingConfig {
  id: string;
  name: string;
  ranges?: string;
  waterType?: WaterType;
  waterRate?: number;
  groups?: {
    ranges: string;
    waterType: WaterType;
    waterRate: number;
    note: string;
  }[];
}

export interface RoomInfo {
  id: string; // e.g., 'thachana_101'
  buildingId: string;
  buildingName: string;
  roomNo: string;
  floor: number;
  waterType: WaterType;
  waterRate: number;
  waterNote: string;
}

export interface MeterRecord {
  roomId: string;
  buildingId: string;
  buildingName: string;
  roomNo: string;
  floor: number;
  waterType: WaterType;

  waterPrev: number;
  waterCurr: number;
  occupants: number;
  waterUnits: number;
  waterCost: number;
  waterPhoto?: string | null;

  elecPrev: number;
  elecCurr: number;
  elecUnits: number;
  elecCost: number;
  elecPhoto?: string | null;

  remark: string;
  totalAmount: number;
  recordedAt: string;
}

export interface DormSettings {
  defaultElecRate: number; // e.g. 7 or 8 THB/unit
  defaultWaterRate: number; // e.g. 20 THB/unit
  defaultFlatWaterRate: number; // e.g. 100 THB/person
}

export interface SheetRowData {
  roomId: string;
  roomNo: string;
  waterType: WaterType;
  hasRecord: boolean;

  waterPrev: number;
  waterCurr: number;
  waterUnits: number;
  waterCost: number;
  occupants: number;

  elecPrev: number;
  elecCurr: number;
  elecUnits: number;
  elecCost: number;

  totalAmount: number;
  remark: string;
}

export interface SheetTotals {
  waterUnits: number;
  elecUnits: number;
  waterCost: number;
  elecCost: number;
  totalAmount: number;
}

export interface CalendarEventSummary {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}
