import { useState } from 'react';
import type { ReplyInput } from '../types/models';

interface ReplyFormProps {
  onSubmit: (input: ReplyInput) => void;
  threadId: string;
  isSubmitting?: boolean;
}

export default function ReplyForm({ onSubmit, threadId, isSubmitting = false }: ReplyFormProps) {
  const [bodyMarkdown, setBodyMarkdown] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bodyMarkdown.trim()) return;

    onSubmit({
      threadId,
      bodyMarkdown: bodyMarkdown.trim(),
    });

    setBodyMarkdown('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Your Reply</label>
        <textarea
          className="textarea"
          rows={4}
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          placeholder="Join the conversation..."
          required
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isSubmitting || !bodyMarkdown.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
        <strong>Simulated:</strong> Reply saved locally for demo.
      </div>
    </form>
  );
}
