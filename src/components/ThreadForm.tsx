import { useState } from 'react';
import type { ThreadInput } from '../types/models';

interface ThreadFormProps {
  onSubmit: (input: ThreadInput) => void;
  propertyId: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export default function ThreadForm({ onSubmit, propertyId, isSubmitting = false, onCancel }: ThreadFormProps) {
  const [title, setTitle] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyMarkdown.trim()) return;

    onSubmit({
      propertyId,
      title: title.trim(),
      bodyMarkdown: bodyMarkdown.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Thread Title *</label>
        <input
          type="text"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your topic?"
          required
        />
      </div>

      <div>
        <label className="label">Message *</label>
        <textarea
          className="textarea"
          rows={6}
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          placeholder="Share your thoughts, questions, or recommendations..."
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Thread'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>Simulated:</strong> Your post will be saved locally for demonstration.
      </div>
    </form>
  );
}
