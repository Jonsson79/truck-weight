import React, { useState } from 'react';
import { TruckEntry } from '../types';
import { FileDown, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { deleteEntry } from '../utils/supabase';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface EntryListProps {
  entries: TruckEntry[];
}

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

const exportToXLSX = (entries: TruckEntry[]): void => {
  const excelData = entries.map(entry => ({
    'Truck ID': entry.truckId,
    'Weight (tons)': entry.weight,
    'Comments': entry.comments,
    'Date': formatDate(entry.startTime),
    'Start Time': formatTime(entry.startTime),
    'Stop Time': entry.stopTime ? formatTime(entry.stopTime) : '-'
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  const colWidths = [
    { wch: 15 }, // Truck ID
    { wch: 12 }, // Weight
    { wch: 30 }, // Comments
    { wch: 12 }, // Date
    { wch: 12 }, // Start Time
    { wch: 12 }  // Stop Time
  ];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Truck Entries');
  XLSX.writeFile(wb, `truck-entries-${formatDate(new Date().toISOString())}.xlsx`);
};

export const EntryList: React.FC<EntryListProps> = ({ entries }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (entryId: string) => {
    setSelectedEntryId(entryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntryId) return;

    try {
      setIsDeleting(true);
      await deleteEntry(selectedEntryId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setIsDeleting(false);
      setSelectedEntryId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <button
          onClick={() => exportToXLSX(entries)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Truck ID</th>
              <th className="px-4 py-2 text-left">Weight (tons)</th>
              <th className="px-4 py-2 text-left">Comments</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Start Time</th>
              <th className="px-4 py-2 text-left">Stop Time</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{entry.truckId}</td>
                <td className="px-4 py-2">{entry.weight}</td>
                <td className="px-4 py-2">{entry.comments}</td>
                <td className="px-4 py-2">{formatDate(entry.startTime)}</td>
                <td className="px-4 py-2">{formatTime(entry.startTime)}</td>
                <td className="px-4 py-2">
                  {entry.stopTime ? formatTime(entry.stopTime) : '-'}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteClick(entry.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        entryId={selectedEntryId || ''}
      />
    </div>
  );
};