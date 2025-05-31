
import React from 'react';
import { AlertTriangle, Info, Clock, Users } from 'lucide-react';
import { type MedicineInfo } from '../lib/gemini';
import { useSpeechSynthesis } from '../hooks/useSpeech';

interface MedicineDetailsProps {
  medicineInfo: MedicineInfo;
}

const MedicineDetails: React.FC<MedicineDetailsProps> = ({ medicineInfo }) => {
  const { speak, isSpeaking, stop } = useSpeechSynthesis();

  const speakInformation = () => {
    const textToSpeak = `
      Medicine: ${medicineInfo.name}.
      ${medicineInfo.genericName ? `Generic name: ${medicineInfo.genericName}.` : ''}
      Uses: ${medicineInfo.uses.join(', ')}.
      Dosage: ${medicineInfo.dosage}.
      Common side effects: ${medicineInfo.sideEffects.join(', ')}.
      Important warnings: ${medicineInfo.warnings.join(', ')}.
    `;
    speak(textToSpeak);
  };

  return (
    <div className="elder-card animate-scale-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="elder-heading mb-4 sm:mb-0">{medicineInfo.name}</h2>
        <button
          onClick={isSpeaking ? stop : speakInformation}
          className="elder-button-secondary"
        >
          {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
        </button>
      </div>

      {medicineInfo.genericName && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <p className="elder-text-primary">
            <strong>Generic Name:</strong> {medicineInfo.genericName}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <section>
          <h3 className="flex items-center gap-3 elder-text-primary text-elder-xl font-semibold mb-3">
            <Info className="text-elder-blue" size={24} />
            What is this medicine used for?
          </h3>
          <ul className="space-y-2">
            {medicineInfo.uses.map((use, index) => (
              <li key={index} className="elder-text-secondary flex items-start gap-2">
                <span className="text-elder-blue mt-1">•</span>
                {use}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="flex items-center gap-3 elder-text-primary text-elder-xl font-semibold mb-3">
            <Clock className="text-elder-green" size={24} />
            How to take this medicine
          </h3>
          <p className="elder-text-secondary bg-green-50 p-4 rounded-xl">
            {medicineInfo.dosage}
          </p>
        </section>

        <section>
          <h3 className="flex items-center gap-3 elder-text-primary text-elder-xl font-semibold mb-3">
            <AlertTriangle className="text-elder-orange" size={24} />
            Possible side effects
          </h3>
          <ul className="space-y-2">
            {medicineInfo.sideEffects.map((effect, index) => (
              <li key={index} className="elder-text-secondary flex items-start gap-2">
                <span className="text-elder-orange mt-1">•</span>
                {effect}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="flex items-center gap-3 elder-text-primary text-elder-xl font-semibold mb-3">
            <AlertTriangle className="text-red-500" size={24} />
            Important warnings
          </h3>
          <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
            <ul className="space-y-2">
              {medicineInfo.warnings.map((warning, index) => (
                <li key={index} className="elder-text-secondary flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {medicineInfo.interactions.length > 0 && (
          <section>
            <h3 className="flex items-center gap-3 elder-text-primary text-elder-xl font-semibold mb-3">
              <Users className="text-purple-500" size={24} />
              Drug interactions
            </h3>
            <ul className="space-y-2">
              {medicineInfo.interactions.map((interaction, index) => (
                <li key={index} className="elder-text-secondary flex items-start gap-2">
                  <span className="text-purple-500 mt-1">•</span>
                  {interaction}
                </li>
              ))}
            </ul>
          </section>
        )}

        {medicineInfo.manufacturer && (
          <section className="bg-gray-50 p-4 rounded-xl">
            <p className="elder-text-secondary">
              <strong>Manufacturer:</strong> {medicineInfo.manufacturer}
            </p>
          </section>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
        <p className="elder-text-secondary">
          <strong>Important:</strong> This information is for educational purposes only. 
          Always consult your doctor or pharmacist before taking any medicine.
        </p>
      </div>
    </div>
  );
};

export default MedicineDetails;
