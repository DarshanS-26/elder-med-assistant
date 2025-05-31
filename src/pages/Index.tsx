
import React, { useState, useEffect } from 'react';
import { Pill, Bell, Search, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthForm from '../components/AuthForm';
import MedicineSearch from '../components/MedicineSearch';
import ReminderForm from '../components/ReminderForm';
import ReminderList from '../components/ReminderList';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'reminders'>('search');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-elder-background">
        <div className="elder-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-elder-background">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill className="text-elder-blue" size={40} />
            <h1 className="elder-heading text-elder-2xl">Medicine Assistant</h1>
          </div>
          
          <button
            onClick={handleSignOut}
            className="elder-button-outline flex items-center gap-2"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-3 px-6 py-4 elder-text-lg font-medium border-b-4 transition-colors ${
                activeTab === 'search'
                  ? 'border-elder-blue text-elder-blue bg-blue-50'
                  : 'border-transparent text-elder-text-light hover:text-elder-blue'
              }`}
            >
              <Search size={24} />
              Search Medicine
            </button>
            
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-3 px-6 py-4 elder-text-lg font-medium border-b-4 transition-colors ${
                activeTab === 'reminders'
                  ? 'border-elder-green text-elder-green bg-green-50'
                  : 'border-transparent text-elder-text-light hover:text-elder-green'
              }`}
            >
              <Bell size={24} />
              My Reminders
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'search' && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="elder-heading text-elder-3xl">Find Medicine Information</h2>
              <p className="elder-text-secondary">
                Search by name, upload a photo, or use voice to get detailed medicine information
              </p>
            </div>
            <MedicineSearch />
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="space-y-8">
            <div className="mb-8 text-center">
              <h2 className="elder-heading text-elder-3xl">Medicine Reminders</h2>
              <p className="elder-text-secondary">
                Set up reminders for your medicines and get voice notifications
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <ReminderForm userId={user.id} />
              <ReminderList userId={user.id} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="elder-text-secondary">
            Medicine Assistant - Your trusted companion for medicine information and reminders
          </p>
          <p className="elder-text-secondary mt-2">
            Always consult your healthcare provider for medical advice
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
