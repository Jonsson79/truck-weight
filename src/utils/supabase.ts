import { createClient } from '@supabase/supabase-js';
import type { TruckEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const saveEntry = async (entry: TruckEntry): Promise<void> => {
  const { error } = await supabase
    .from('entries')
    .insert([{
      id: entry.id,
      truck_id: entry.truckId,
      weight: entry.weight,
      comments: entry.comments,
      start_time: entry.startTime,
      stop_time: entry.stopTime
    }]);

  if (error) {
    console.error('Error saving entry:', error);
    throw new Error('Failed to save entry');
  }
};

export const deleteEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    throw new Error('Failed to delete entry');
  }
};

export const getEntries = async (): Promise<TruckEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) throw error;

    return (data || []).map(entry => ({
      id: entry.id,
      truckId: entry.truck_id,
      weight: entry.weight,
      comments: entry.comments,
      startTime: entry.start_time,
      stopTime: entry.stop_time
    }));
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw new Error('Failed to fetch entries');
  }
};

export const subscribeToEntries = (callback: (entries: TruckEntry[]) => void) => {
  const channel = supabase
    .channel('entries_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'entries' },
      async () => {
        try {
          const entries = await getEntries();
          callback(entries);
        } catch (error) {
          console.error('Error in subscription:', error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};