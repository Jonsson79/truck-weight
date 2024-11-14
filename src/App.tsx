import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { EntryList } from './components/EntryList';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TruckEntry, FormData } from './types';
import { saveEntry, getEntries, subscribeToEntries } from './utils/supabase';
import { Truck, Scale, Timer as TimerIcon } from 'lucide-react';

function App() {
  const [entries, setEntries] = useState<TruckEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    truckId: '',
    weight: '',
    comments: '',
  });

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEntries();
        setEntries(data);
      } catch (err) {
        console.error('Error loading entries:', err);
        setError('Unable to load entries. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();

    const unsubscribe = subscribeToEntries((newEntries) => {
      setEntries(newEntries);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date().toISOString());
    setError(null);
  };

  const handleStop = async () => {
    if (!startTime) return;
    setIsLoading(true);

    try {
      const newEntry: TruckEntry = {
        id: crypto.randomUUID(),
        truckId: formData.truckId || 'Unknown',
        weight: Number(formData.weight) || 0,
        comments: formData.comments,
        startTime,
        stopTime: new Date().toISOString(),
      };

      await saveEntry(newEntry);
      setFormData({ truckId: '', weight: '', comments: '' });
      setIsRunning(false);
      setStartTime(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {error && <ErrorMessage message={error} />}
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Truck Weight Logger</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Truck ID
                    </div>
                  </label>
                  <input
                    type="text"
                    name="truckId"
                    value={formData.truckId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter truck ID (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Weight (tons)
                    </div>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter weight in tons (optional)"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <TimerIcon className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold">Session Timer</h2>
                  </div>
                  <Timer startTime={startTime} isRunning={isRunning} />
                </div>

                <button
                  onClick={isRunning ? handleStop : handleStart}
                  disabled={isLoading}
                  className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isRunning
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : isRunning ? 'Stop Session' : 'Start Session'}
                </button>
              </div>
            </div>
          </div>

          {isLoading && !entries.length ? (
            <LoadingSpinner />
          ) : (
            <EntryList entries={entries} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;