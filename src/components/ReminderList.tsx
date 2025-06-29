
import React, { useEffect, useState } from 'react';
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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [firedReminders, setFiredReminders] = useState<Set<string>>(new Set());

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

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, []);

  // Check for due reminders every minute
  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      console.log('Checking reminders at:', currentTime);
      
      reminders.forEach((reminder) => {
        const reminderKey = `${reminder.id}-${currentTime}`;
        
        // Check if this reminder hasn't been fired today at this time
        if (reminder.reminder_time === currentTime && !firedReminders.has(reminderKey)) {
          console.log('Firing reminder for:', reminder.medicine_name);
          
          // Mark this reminder as fired
          setFiredReminders(prev => new Set(prev).add(reminderKey));
          
          // Show browser notification
          if (notificationPermission === 'granted') {
            const notification = new Notification(`Medicine Reminder: ${reminder.medicine_name}`, {
              body: `It's time to take your ${reminder.medicine_name}`,
              icon: '/favicon.ico',
              tag: reminder.id, // Prevent duplicate notifications
            });
            
            // Auto-close notification after 10 seconds
            setTimeout(() => notification.close(), 10000);
          }
          
          // Play notification sound
          playNotificationSound();
          
          // Speak the reminder
          speak(`Time to take your ${reminder.medicine_name}`);
          
          // Show toast notification
          toast.success(`Reminder: Time to take ${reminder.medicine_name}!`, {
            duration: 10000,
          });
        }
      });
    };

    // Check immediately
    checkReminders();
    
    // Then check every minute
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [reminders, notificationPermission, firedReminders, speak]);

  // Reset fired reminders at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setFiredReminders(new Set());
      
      // Set up daily reset
      const dailyReset = setInterval(() => {
        setFiredReminders(new Set());
      }, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyReset);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, []);

  // Create notification sound
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaCTuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2+/SgDIGJHbE8d+SRAoUXbrn66hUFAlGnt3yv2AbCDuN2'
    );
    
    audio.play().catch(err => {
      console.log('Could not play notification sound:', err);
    });
  };

  if (isLoading) {
    return (
      <div className="elder-card animate-fade-in">
        <h2 className="elder-heading flex items-center gap-3">
          <Bell className="text-elder-green" size={32} />
          My Reminders
        </h2>
        <div className="elder-text-secondary">Loading reminders...</div>
      </div>
    );
  }

  return (
    <div className="elder-card animate-fade-in">
      <h2 className="elder-heading flex items-center gap-3">
        <Bell className="text-elder-green" size={32} />
        My Reminders
      </h2>

      {notificationPermission !== 'granted' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="elder-text-secondary text-sm">
            <strong>Note:</strong> Please allow browser notifications to receive reminder alerts.
          </p>
        </div>
      )}

      {!reminders || reminders.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="elder-text-secondary">No reminders set yet.</p>
          <p className="elder-text-secondary text-sm mt-2">
            Add your first reminder using the form on the left.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="elder-text-primary font-semibold text-lg">
                    {reminder.medicine_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={20} className="text-elder-blue" />
                    <span className="elder-text-secondary">
                      {reminder.reminder_time}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteReminderMutation.mutate(reminder.id)}
                  disabled={deleteReminderMutation.isPending}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete reminder"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="elder-text-secondary">
          <strong>How it works:</strong> You'll receive a browser notification, 
          hear a voice reminder, and see a toast message when it's time to take your medicine.
        </p>
      </div>
    </div>
  );
};

export default ReminderList;
