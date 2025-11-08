import { useState } from 'react';
import type { TicketInput, TicketPriority } from '../types/models';

interface TicketFormProps {
  onSubmit: (input: TicketInput) => void;
  cabinId: string;
  propertyId: string;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { value: 'Plumbing', subcategories: ['Leak', 'Clog', 'Water Pressure', 'Other'] },
  { value: 'Electrical', subcategories: ['Outlet', 'Light Fixture', 'Breaker', 'Other'] },
  { value: 'HVAC', subcategories: ['Heating', 'Cooling', 'Thermostat', 'Other'] },
  { value: 'Appliances', subcategories: ['Refrigerator', 'Dishwasher', 'Washer/Dryer', 'Other'] },
  { value: 'Structural', subcategories: ['Door', 'Window', 'Roof', 'Floor', 'Other'] },
  { value: 'Other', subcategories: ['Other'] },
];

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function TicketForm({ onSubmit, cabinId, propertyId, isSubmitting = false }: TicketFormProps) {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [description, setDescription] = useState('');

  const selectedCategory = CATEGORIES.find((c) => c.value === category);
  const subcategories = selectedCategory?.subcategories || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory || !description.trim()) return;

    onSubmit({
      propertyId,
      cabinId,
      category,
      subcategory,
      priority,
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="label">Category *</label>
        <select
          className="select"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory('');
          }}
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.value}
            </option>
          ))}
        </select>
      </div>

      {category && (
        <div>
          <label className="label">Subcategory *</label>
          <select
            className="select"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            required
          >
            <option value="">Select a subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Priority *</label>
        <select
          className="select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TicketPriority)}
          required
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Description *</label>
        <textarea
          className="textarea"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Be as specific as possible to help us resolve your issue quickly.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Note:</strong> This is a simulated submission. Your ticket will be saved locally for demonstration purposes.
      </div>
    </form>
  );
}
