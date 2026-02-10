'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const TRAINING_UPLOAD_ENDPOINT = `${API_BASE_URL}/ai/training/upload`;

interface TrainingUploadFormProps {
  audience: 'Admin' | 'SuperAdmin';
}

const TrainingUploadForm: React.FC<TrainingUploadFormProps> = ({ audience }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [lastSuccess, setLastSuccess] = useState<{
    title: string;
    description: string;
    tags: string;
    fileCount: number;
    audience: string;
    timestamp: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error('Please attach at least one file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('audience', audience);
    if (tags.trim()) {
      formData.append('tags', tags.trim());
    }
    Array.from(files).forEach((file) => formData.append('files', file));

    setIsSubmitting(true);
    setProgress(null);

    try {
      // TODO: Replace with real backend call when available.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setProgress(100);

      // Only show success once we hit 100%
      toast.success('Training data uploaded successfully (simulated).');
      setLastSuccess({
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim(),
        fileCount: files.length,
        audience,
        timestamp: new Date().toISOString(),
      });
      setTitle('');
      setDescription('');
      setTags('');
      setFiles(null);
      // Keep the 100% indicator briefly, then clear
      setTimeout(() => setProgress(null), 800);
    } catch (error) {
      console.error('Error uploading training data:', error);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Failed to upload training data';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-3 rounded-xl">
          <Upload className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">AI Education Upload</h1>
          <p className="text-gray-600">Upload documents and data to improve the AI knowledge base.</p>
          <p className="text-xs text-gray-500 mt-1">Audience: {audience}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
            placeholder="e.g., Fire safety SOPs"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[120px] px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
            placeholder="Short summary to help the AI understand the content."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-300 focus:outline-none"
            placeholder="e.g., fire, safety, procedure"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Files</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-300 transition-colors">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full"
              accept=".pdf,.doc,.docx,.txt,.csv,.json"
            />
            <p className="text-gray-500 text-sm mt-2">Supported: PDF, DOC/DOCX, TXT, CSV, JSON</p>
          </div>
        </div>

        {progress !== null && (
          <div
            className={`flex items-center gap-2 text-sm ${
              progress === 100 ? 'text-green-700' : 'text-gray-700'
            }`}
          >
            {progress === 100 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            )}
            {progress === 100 ? '100% complete' : `Uploading... ${progress}%`}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Ensure documents do not contain sensitive information before uploading.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Upload Training Data
            </>
          )}
        </button>
      </form>

      {lastSuccess && (
        <div className="mt-8 border-2 border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
            <CheckCircle className="w-5 h-5" />
            Last successful upload
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
            <div><span className="font-semibold">Title:</span> {lastSuccess.title || '—'}</div>
            <div><span className="font-semibold">Audience:</span> {lastSuccess.audience}</div>
            <div><span className="font-semibold">Files:</span> {lastSuccess.fileCount}</div>
            <div><span className="font-semibold">Tags:</span> {lastSuccess.tags || 'None'}</div>
            <div className="md:col-span-2">
              <span className="font-semibold">Description:</span> {lastSuccess.description || '—'}
            </div>
            <div className="md:col-span-2 text-xs text-gray-600">
              Uploaded at: {new Date(lastSuccess.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <FileText className="w-5 h-5 text-red-600" />
            Suggested content
          </div>
          <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>SOPs and checklists</li>
            <li>Training manuals and curricula</li>
            <li>Reference guides and FAQs</li>
            <li>Annotated incident reports (redacted)</li>
          </ul>
        </div>
        <div className="border-2 border-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Tips
          </div>
          <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Prefer structured text (PDF/TXT/CSV/JSON) over images.</li>
            <li>Group related files with clear titles and tags.</li>
            <li>Keep descriptions concise so the AI can classify content.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrainingUploadForm;

