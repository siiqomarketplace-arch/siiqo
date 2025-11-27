import React, { useState, useEffect } from 'react';
import { StorefrontData } from '@/types/vendor/storefront';
import ImageUpload from './ImageUpload';

interface StorefrontCustomizationProps {
    storefrontData: StorefrontData | null;
    onSave: (updatedData: Partial<StorefrontData>) => Promise<void>;
    saving: boolean;
}

const themes = [
    { id: 'light', name: 'Light', bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200' },
    { id: 'dark', name: 'Dark', bg: 'bg-gray-800', text: 'text-white', border: 'border-gray-700' },
    { id: 'mint', name: 'Mint', bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-200' },
];

const fonts = [
    { id: 'Arial', name: 'Arial' },
    { id: 'Verdana', name: 'Verdana' },
    { id: 'Georgia', name: 'Georgia' },
];

const StorefrontCustomization: React.FC<StorefrontCustomizationProps> = ({
  storefrontData,
  onSave,
  saving
}) => {
  const [theme, setTheme] = useState(storefrontData?.template_options?.theme || 'light');
  const [font, setFont] = useState(storefrontData?.template_options?.font || 'Arial');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showCallButton, setShowCallButton] = useState(true);
  const [teamSize, setTeamSize] = useState('');
  const [businessHours, setBusinessHours] = useState('');
  const [established, setEstablished] = useState('');
  const [about, setAbout] = useState(storefrontData?.about || '');

  useEffect(() => {
    if (storefrontData) {
      setTheme(storefrontData.template_options?.theme || 'light');
      setFont(storefrontData.template_options?.font || 'Arial');
      setShowCallButton(storefrontData.showCallButton ?? true);
      setTeamSize(storefrontData.teamSize || '');
      setBusinessHours(storefrontData.businessHours || '');
      setEstablished(storefrontData.established || '');
      setAbout(storefrontData.about || '');
    }
  }, [storefrontData]);

  const handleSave = () => {
    const updatedData: Partial<StorefrontData> = {
      template_options: { theme, font },
      bannerFile,
      logoFile,
      showCallButton,
      teamSize,
      businessHours,
      established,
      about,
    };
    onSave(updatedData);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Customize Your Storefront</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload label="Banner Image" onFileChange={setBannerFile} initialImage={storefrontData?.bannerImage} />
            <ImageUpload label="Logo" onFileChange={setLogoFile} initialImage={storefrontData?.logo} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-lg cursor-pointer border-2 ${
                  theme === t.id ? 'border-blue-500' : t.border
                } ${t.bg} ${t.text}`}
                onClick={() => setTheme(t.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.name}</span>
                  {theme === t.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Font</h3>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            {fonts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">About Your Business</h3>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            rows={6}
            placeholder="Tell customers about your business..."
          ></textarea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">Show Call Button</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showCallButton} onChange={() => setShowCallButton(!showCallButton)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div>
              <label className="block font-medium mb-1">Team Size</label>
              <input type="text" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block font-medium mb-1">Business Hours</label>
              <textarea value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" rows={4}></textarea>
            </div>
            <div>
              <label className="block font-medium mb-1">Established</label>
              <input type="text" value={established} onChange={(e) => setEstablished(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Applying...' : 'Apply Changes'}
        </button>
      </div>
    </div>
  );
};

export default StorefrontCustomization;
