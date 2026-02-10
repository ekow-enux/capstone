// Station Types matching API response structure
export type StationStatus = 'in commission' | 'out of commission';

export interface Station {
  _id: string;
  id: string; // Duplicate of _id for convenience
  name: string;
  location: string;
  location_url?: string;
  lat?: number;
  lng?: number;
  phone_number?: string | null;
  placeId?: string;
  status?: StationStatus;
  departments?: Array<{ _id?: string; id?: string; name?: string; [key: string]: unknown }>;
  personnel?: Array<{ _id?: string; id?: string; name?: string; [key: string]: unknown }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface StationResponse {
  success: boolean;
  count: number;
  data: Station[];
}

// Station IDs from the provided data for easy reference
export const STATION_IDS = {
  ACCRA_CENTRAL: '69049470ee691673e388de18',
  ACCRA_CITY: '6902474aee691673e388dd9e',
  ACCRA_REGIONAL_HQ: '6902474aee691673e388dd8a',
  AMAMORLEY: '6902474aee691673e388dd9a',
  ANYAA: '6902474aee691673e388dd90',
  DANSONAN: '6902474aee691673e388dda6',
  FIRE_ACADEMY: '6902474aee691673e388dda2',
  ADENTA: '6902474aee691673e388ddb0',
  GHANA_HQ: '69024721ee691673e388dd5f',
  UG_STATION: '6902474bee691673e388ddb4',
  MADINA: '6902474aee691673e388dda8',
  NATIONAL_FIRE_SERVICE: '6902474aee691673e388dda4',
  MILE_11: '6902474aee691673e388ddac',
  CIRCLE: '6902474aee691673e388dd88',
  AMASAMAN: '6902474bee691673e388ddb6',
  MOTORWAY: '6902474aee691673e388ddae',
  WEST_MUNICIPAL: '6902474aee691673e388dd93',
  TESHIE: '6902474aee691673e388dd96',
  WEIJA: '6902474aee691673e388ddaa',
} as const;

