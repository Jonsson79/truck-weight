import axios from 'axios';
import type { TruckEntry } from '../types';

const API_URL = 'http://localhost:3001/entries';

export const saveEntry = async (entry: TruckEntry): Promise<void> => {
  await axios.post(API_URL, entry);
};

export const deleteEntry = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const getEntries = async (): Promise<TruckEntry[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Poll for updates every 2 seconds
export const subscribeToEntries = (callback: (entries: TruckEntry[]) => void) => {
  const intervalId = setInterval(async () => {
    try {
      const entries = await getEntries();
      callback(entries);
    } catch (error) {
      console.error('Error polling entries:', error);
    }
  }, 2000);

  return () => clearInterval(intervalId);
};