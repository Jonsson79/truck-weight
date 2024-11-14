export interface TruckEntry {
  id: string;
  truckId: string;
  weight: number;
  comments: string;
  startTime: string;
  stopTime: string | null;
}

export interface FormData {
  truckId: string;
  weight: string;
  comments: string;
}