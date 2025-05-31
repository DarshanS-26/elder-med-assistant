
import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ReminderFormProps {
  userId: string;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ userId }) => {
  const [medicineName, setMedicineName] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const queryClient = useQueryClient();

  const addReminderMutation = useMutation({
    mutationFn: async (data: { medicine_name: string; reminder_time: string }) => {
      const { error } = await supabase
        .from('reminders')
        .insert([
          {
            user_id: userId,
            medicine_name: data.medicine_name,
            reminder_time: data.reminder_time,
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reminder added successfully!');
      setMedicineName('');
      setReminderTime('');
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
    },
    onError: (error: any) => {
      toast.error('Failed to add reminder: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (medicineName.trim() && reminderTime) {
      addReminderMutation.mutate({
        medicine_name: medicineName.trim(),
        reminder_time: reminderTime,
      });
    }
  };

  return (
    <div className="elder-card animate-fade-in">
      <h2 className="elder-heading flex items-center gap-3">
        <Clock className="text-elder-blue" size={32} />
        Add Medicine Reminder
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="medicine-name" className="block elder-text-primary mb-3">
            Medicine Name
          </label>
          <input
            id="medicine-name"
            type="text"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            placeholder="Enter medicine name"
            className="elder-input w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="reminder-time" className="block elder-text-primary mb-3">
            Reminder Time
          </label>
          <input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="elder-input w-full"
            required
          />
        </div>

        <button
          type="submit"
          disabled={addReminderMutation.isPending || !medicineName.trim() || !reminderTime}
          className="elder-button-primary w-full flex items-center justify-center gap-3"
        >
          <Plus size={28} />
          {addReminderMutation.isPending ? 'Adding Reminder...' : 'Add Reminder'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-green-50 rounded-xl">
        <p className="elder-text-secondary">
          <strong>Tip:</strong> Set reminders for important medicines like blood pressure, 
          diabetes, or heart medications. You'll get a voice notification at the scheduled time.
        </p>
      </div>
    </div>
  );
};

export default ReminderForm;
