'use client';

import React, { useState } from 'react';
import { Flame, PlusCircle, CheckCircle, Info, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SafetyTip {
  id: string;
  title: string;
  category: string;
  audience: string;
  description: string;
}

const initialTips: SafetyTip[] = [
  {
    id: '1',
    title: 'Check Smoke Detectors Monthly',
    category: 'Home Safety',
    audience: 'Public',
    description: 'Test all smoke alarms once a month and replace batteries at least once a year.',
  },
  {
    id: '2',
    title: 'Kitchen Fire Safety',
    category: 'Kitchen',
    audience: 'Home Owners',
    description: 'Never leave cooking unattended. Keep flammable items away from the stove and have a fire blanket or extinguisher nearby.',
  },
];

const AdminFireSafetyPage: React.FC = () => {
  const [tips, setTips] = useState<SafetyTip[]>(initialTips);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [audience, setAudience] = useState('Public');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const countWords = (text: string) =>
    text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  const handleAddTip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide at least a title and description.');
      return;
    }
    if (countWords(description) > 200) {
      toast.error('Tip text is too long. Please keep it within 200 words.');
      return;
    }
    setIsSaving(true);
    try {
      // TODO: Replace with real API call when backend is ready.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTip: SafetyTip = {
        id: Date.now().toString(),
        title: title.trim(),
        category: category.trim(),
        audience: audience.trim(),
        description: description.trim(),
      };
      setTips((prev) => [newTip, ...prev]);
      toast.success('Safety tip saved (local preview).');
      setTitle('');
      setCategory('General');
      setAudience('Public');
      setDescription('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save tip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTip = (id: string) => {
    setTips((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tip removed (local only).');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-6">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Fire Safety Tips</h1>
          <p className="text-gray-600">
            Create and manage safety tips to share with your station and the public.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-50 p-3 border border-red-100">
            <Flame className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create / edit form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-600" />
                New Safety Tip
              </h2>
              <p className="text-sm text-gray-600">
                Capture best practices your team can share with communities.
              </p>
            </div>
          </div>
          <form onSubmit={handleAddTip} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray  -700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                placeholder="e.g. Safe Use of Gas Cylinders at Home"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option>General</option>
                  <option>Home Safety</option>
                  <option>Market / Shops</option>
                  <option>Industrial</option>
                  <option>Road Traffic</option>
                  <option>Public Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                >
                  <option>Public</option>
                  <option>Businesses</option>
                  <option>Schools</option>
                  <option>Market Women</option>
                  <option>Industrial Facilities</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Message</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white resize-vertical"
                placeholder="Describe the safety tip in simple language (max 200 words)."
              />
              <p className="mt-1 text-xs text-gray-500">
                {countWords(description)} / 200 words
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4" />
                <span>These tips are stored locally for now and can be synced to the backend later.</span>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Tip'}
              </button>
            </div>
          </form>
        </div>

        {/* Tips list */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Current Tips ({tips.length})
            </h2>
          </div>
          {tips.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-8">
              <Flame className="w-10 h-10 mb-3 text-gray-300" />
              <p className="font-medium">No safety tips added yet.</p>
              <p className="text-sm mt-1">Use the form on the left to create your first tip.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {tips.map((tip) => (
                <div
                  key={tip.id}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100/70 transition-colors flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        {tip.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                          {tip.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {tip.audience}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTip(tip.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove tip (local only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFireSafetyPage;


