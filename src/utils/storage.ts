import axios from 'axios';
import { TruckEntry } from '../types';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:3001/entries';

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('sv-SE');
};

const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

export const saveEntry = async (entry: TruckEntry): Promise<void> => {
  await axios.post(API_URL, entry);
};

export const getEntries = async (): Promise<TruckEntry[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const exportToXLSX = async (): Promise<void> => {
  const entries = await getEntries();
  
  // Transform data for Excel
  const excelData = entries.map(entry => ({
    'Truck ID': entry.truckId,
    'Weight (tons)': entry.weight,
    'Comments': entry.comments,
    'Date': formatDate(entry.startTime),
    'Start Time': formatTime(entry.startTime),
    'Stop Time': entry.stopTime ? formatTime(entry.stopTime) : '-'
  }));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = [
    { wch: 15 }, // Truck ID
    { wch: 12 }, // Weight
    { wch: 30 }, // Comments
    { wch: 12 }, // Date
    { wch: 12 }, // Start Time
    { wch: 12 }  // Stop Time
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Truck Entries');

  // Generate Excel file
  XLSX.writeFile(wb, `truck-entries-${formatDate(new Date().toISOString())}.xlsx`);
};