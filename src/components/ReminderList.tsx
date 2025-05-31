
import React, { useEffect } from 'react';
import { Clock, Trash2, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSpeechSynthesis } from '../hooks/useSpeech';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  user_id: string;
  medicine_name: string;
  reminder_time: string;
  created_at: string;
}

interface ReminderListProps {
  userId: string;
}

const ReminderList: React.FC<ReminderListProps> = ({ userId }) => {
  const { speak } = useSpeechSynthesis();
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_time');
      
      if (error) throw error;
      return data as Reminder[];
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reminder deleted');
      queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete reminder: ' + error.message);
    }
  });

  // Check for reminders every minute
  useEffect(() => {
    if (!reminders) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

      reminders.forEach((reminder) => {
        if (reminder.reminder_time === currentTime) {
          const message = `Time to take your medicine: ${reminder.medicine_name}`;
          speak(message);
          toast.success(message, {
            duration: 10000,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders, speak]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="elder-card">
        <div className="elder-text-secondary text-center">Loading reminders...</div>
      </div>
    );
  }

  if (!reminders || reminders.length === 0) {
    return (
      <div className="elder-card text-center">
        <Bell className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="elder-heading">No Reminders Set</h3>
        <p className="elder-text-secondary">
          Add your first medicine reminder to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="elder-card animate-fade-in">
      <h2 className="elder-heading flex items-center gap-3 mb-6">
        <Bell className="text-elder-green" size={32} />
        Your Medicine Reminders
      </h2>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <Clock className="text-elder-blue" size={24} />
              <div>
                <h3 className="elder-text-primary font-semibold">
                  {reminder.medicine_name}
                </h3>
                <p className="elder-text-secondary">
                  {formatTime(reminder.reminder_time)}
                </p>
              </div>
            </div>

            <button
              onClick={() => deleteReminderMutation.mutate(reminder.id)}
              disabled={deleteReminderMutation.isPending}
              className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Delete reminder for ${reminder.medicine_name}`}
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="elder-text-secondary">
          <strong>Note:</strong> Keep this app open to receive voice reminders. 
          You'll hear an announcement when it's time to take your medicine.
        </p>
      </div>
    </div>
  );
};

export default ReminderList;
