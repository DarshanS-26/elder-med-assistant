
import React, { useState } from 'react';
import { Search, Camera, Upload } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { searchMedicine, analyzeMedicineImage, type MedicineInfo } from '../lib/gemini';
import VoiceButton from './VoiceButton';
import MedicineDetails from './MedicineDetails';
import { toast } from 'sonner';

const MedicineSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineInfo, setMedicineInfo] = useState<MedicineInfo | null>(null);

  const searchMutation = useMutation({
    mutationFn: searchMedicine,
    onSuccess: (data) => {
      if ('error' in data) {
        toast.error('Medicine not found. Please check the name and try again.');
      } else {
        setMedicineInfo(data);
        toast.success('Medicine information found!');
      }
    },
    onError: () => {
      toast.error('Failed to search medicine. Please try again.');
    }
  });

  const imageMutation = useMutation({
    mutationFn: analyzeMedicineImage,
    onSuccess: (data) => {
      if ('error' in data) {
        toast.error('Could not identify medicine from image. Please try with a clearer photo.');
      } else {
        setMedicineInfo(data);
        toast.success('Medicine identified from image!');
      }
    },
    onError: () => {
      toast.error('Failed to analyze image. Please try again.');
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery.trim());
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setSearchQuery(transcript);
    if (transcript.trim()) {
      searchMutation.mutate(transcript.trim());
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      imageMutation.mutate(file);
    } else {
      toast.error('Please select a valid image file.');
    }
  };

  const handleCameraCapture = () => {
    // For now, we'll use the same file input but with camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        imageMutation.mutate(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="elder-card">
        <h2 className="elder-heading">Search Medicine</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label htmlFor="medicine-search" className="block elder-text-primary mb-3">
              Enter medicine name:
            </label>
            <input
              id="medicine-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type medicine name here..."
              className="elder-input w-full"
              aria-describedby="search-help"
            />
            <p id="search-help" className="elder-text-secondary mt-2">
              You can type the brand name or generic name of the medicine
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={searchMutation.isPending || !searchQuery.trim()}
              className="elder-button-primary flex items-center justify-center gap-3 flex-1"
            >
              <Search size={28} />
              {searchMutation.isPending ? 'Searching...' : 'Search Medicine'}
            </button>

            <VoiceButton
              onTranscript={handleVoiceInput}
              className="flex-1"
            />
          </div>
        </form>
      </div>

      <div className="elder-card">
        <h2 className="elder-heading">Upload Medicine Photo</h2>
        <p className="elder-text-secondary mb-6">
          Take a photo of your medicine or upload from gallery to identify it
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCameraCapture}
            disabled={imageMutation.isPending}
            className="elder-button-outline flex items-center justify-center gap-3 flex-1"
          >
            <Camera size={28} />
            Take Photo
          </button>

          <label className="elder-button-outline flex items-center justify-center gap-3 flex-1 cursor-pointer">
            <Upload size={28} />
            Upload Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="sr-only"
              disabled={imageMutation.isPending}
            />
          </label>
        </div>

        {imageMutation.isPending && (
          <div className="mt-4 text-center elder-text-secondary">
            Analyzing image...
          </div>
        )}
      </div>

      {medicineInfo && (
        <MedicineDetails medicineInfo={medicineInfo} />
      )}
    </div>
  );
};

export default MedicineSearch;
