import React, { useState } from 'react';
import { Clock, Plus, CalendarIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ReminderFormProps {
  userId: string;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ userId }) => {
  const [medicineName, setMedicineName] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderDate, setReminderDate] = useState<Date>();
  const queryClient = useQueryClient();

  const addReminderMutation = useMutation({
    mutationFn: async (data: { medicine_name: string; reminder_time: string; reminder_date?: string }) => {
      const { error } = await supabase
        .from('reminders')
        .insert([
          {
            user_id: userId,
            medicine_name: data.medicine_name,
            reminder_time: data.reminder_time,
            reminder_date: data.reminder_date,
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reminder added successfully!');
      setMedicineName('');
      setReminderTime('');
      setReminderDate(undefined);
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
        reminder_date: reminderDate ? format(reminderDate, 'yyyy-MM-dd') : undefined,
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

        <div>
          <label className="block elder-text-primary mb-3">
            Reminder Date (Optional)
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal elder-input h-auto py-3",
                  !reminderDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {reminderDate ? format(reminderDate, "PPP") : <span>Pick a specific date (or leave blank for daily)</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={reminderDate}
                onSelect={setReminderDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
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
          diabetes, or heart medications. Leave the date blank for daily reminders, or pick a specific date for one-time reminders.
        </p>
      </div>
    </div>
  );
};

export default ReminderForm;
