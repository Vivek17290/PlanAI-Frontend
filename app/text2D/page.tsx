'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FloorPlan {
  id: string;
  url: string;
  blob: Blob;
  isPreset?: boolean;
}

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [presetPlans, setPresetPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preset images on component mount
  useEffect(() => {
    const loadPresetImages = async () => {
      const presetImages = ['i1.jpg', 'i2.jpg', 'i3.jpg'];
      const loadedPresets: FloorPlan[] = [];

      for (const imageName of presetImages) {
        try {
          const response = await fetch(`/${imageName}`);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          loadedPresets.push({
            id: `preset-${imageName}`,
            url: url,
            blob: blob,
            isPreset: true
          });
        } catch (error) {
          console.error(`Failed to load preset image ${imageName}:`, error);
        }
      }

      setPresetPlans(loadedPresets);
    };

    loadPresetImages();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setFloorPlans([]);
    setError(null);

    try {
      const response = await fetch('https://b4e13d9d3f7f.ngrok-free.app/generate', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.images && Array.isArray(data.images)) {
        const plans: FloorPlan[] = data.images.map((img: any, idx: number) => {
          let base64Data: string;

          if (typeof img === 'string') {
            base64Data = img;
            if (base64Data.startsWith('data:image')) {
              base64Data = base64Data.split(',')[1];
            }
          } else if (img && typeof img === 'object') {
            if (img.base64) {
              base64Data = img.base64;
            } else if (img.data) {
              base64Data = img.data;
            } else {
              console.error('Unexpected image format:', img);
              throw new Error('Unexpected image data format');
            }
          } else {
            console.error('Unexpected image format:', img);
            throw new Error('Unexpected image data format');
          }

          try {
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });

            return {
              id: `plan-${Date.now()}-${idx}`,
              url: `data:image/png;base64,${base64Data}`,
              blob: blob,
            };
          } catch (e) {
            console.error('Base64 decode error:', e);
            throw new Error('Failed to decode image data');
          }
        });
        setFloorPlans(plans);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error generating floor plans:', err);
      setError('Failed to generate floor plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = async (plan: FloorPlan) => {
    setConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', plan.blob, 'floorplan.png');

      const response = await fetch('https://20c57ed9f04c.ngrok-free.app/convert-to-3d', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Mozilla/5.0',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      sessionStorage.setItem('floorplan-json', JSON.stringify(data));

      router.push('/2dEditor');

    } catch (err) {
      console.error('Error converting to 3D:', err);
      setError('Failed to convert to 3D. Please try again.');
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Floor Plan Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Generate floor plans with AI and convert them to 3D JSON
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your floor plan
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Modern 2-bedroom apartment with open kitchen and large living room..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Floor Plans'
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {presetPlans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sample Floor Plans - Click to Continue
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {presetPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleImageClick(plan)}
                  className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-green-400 relative"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={plan.url}
                      fill
                      alt="Sample floor plan"
                      unoptimized
                      className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                    />
                  </div>
                  <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-colors flex items-center justify-center">
                    <span className="bg-white text-green-600 px-6 py-2.5 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      Continue Process
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Sample
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {floorPlans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Generated Floor Plans - Click to Convert & Edit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {floorPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleImageClick(plan)}
                  className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 hover:border-blue-400 relative"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={plan.url}
                      fill
                      alt="Floor plan"
                      unoptimized
                      className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                    />
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                    <span className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      Convert & Edit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {converting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white px-12 py-8 rounded-2xl shadow-2xl">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="text-center">
                  <p className="text-gray-900 font-semibold text-lg">Converting to 3D...</p>
                  <p className="text-gray-600 text-sm mt-1">Redirecting to editor</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}