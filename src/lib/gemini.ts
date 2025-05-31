
export const GEMINI_API_KEY = 'AIzaSyDZk0QKNhGN7qm4vRWxZzbxgH77vMiIVcE';
export const VISION_API_KEY = 'AIzaSyCklYECPRPeojYZ8NUQ8rPx_Kde2_s4tJE';

export interface MedicineInfo {
  name: string;
  genericName?: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  interactions: string[];
  manufacturer?: string;
}

export const searchMedicine = async (medicineName: string): Promise<MedicineInfo> => {
  const prompt = `Provide detailed information about the medicine "${medicineName}" in JSON format with the following structure:
  {
    "name": "Medicine name",
    "genericName": "Generic name if available",
    "uses": ["List of uses"],
    "dosage": "Typical dosage information",
    "sideEffects": ["List of common side effects"],
    "warnings": ["Important warnings and precautions"],
    "interactions": ["Drug interactions"],
    "manufacturer": "Manufacturer name if known"
  }
  
  Please provide accurate, medical information suitable for elderly patients. If the medicine is not found, return an error in the same JSON format with an "error" field.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch medicine information');
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    throw new Error('Failed to parse medicine information');
  }
};

export const analyzeMedicineImage = async (imageFile: File): Promise<MedicineInfo> => {
  const base64 = await fileToBase64(imageFile);
  
  const prompt = `Analyze this image of a medicine/pill/tablet and provide detailed information in JSON format with the following structure:
  {
    "name": "Medicine name if identifiable",
    "genericName": "Generic name if available",
    "uses": ["List of uses"],
    "dosage": "Typical dosage information",
    "sideEffects": ["List of common side effects"],
    "warnings": ["Important warnings and precautions"],
    "interactions": ["Drug interactions"],
    "manufacturer": "Manufacturer name if visible"
  }
  
  If you cannot identify the medicine from the image, return an error in the same JSON format with an "error" field explaining what you can see in the image.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${VISION_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: imageFile.type,
              data: base64.split(',')[1]
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze medicine image');
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    throw new Error('Failed to parse medicine information from image');
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
