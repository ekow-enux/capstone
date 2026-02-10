'use client';

import TrainingUploadForm from '@/components/ai/TrainingUploadForm';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminAIEducationPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <Toaster position="top-right" />
      <TrainingUploadForm audience="Admin" />
    </div>
  );
}



