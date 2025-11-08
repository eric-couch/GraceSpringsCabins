import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotices, getOutages, getProperties } from '../lib/api';
import {
  mergeNoticesWithOverlay,
  mergeOutagesWithOverlay,
  createNotice,
  createOutage,
  updateNotice,
  updateOutage,
  deleteNotice,
  deleteOutage,
} from '../lib/localSim';
import { formatDateTime } from '../lib/utils';
import type { Notice, NoticeInput, Outage, OutageInput, OutageStatus } from '../types/models';

type FormMode = 'notice' | 'outage' | null;

export default function AdminNoticesOutages() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState<FormMode>(null);
  const [editingItem, setEditingItem] = useState<Notice | Outage | null>(null);

  const { data: allNotices = [] } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const notices = await getNotices();
      return mergeNoticesWithOverlay(notices);
    },
  });

  const { data: allOutages = [] } = useQuery({
    queryKey: ['outages'],
    queryFn: async () => {
      const outages = await getOutages();
      return mergeOutagesWithOverlay(outages);
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const createNoticeMutation = useMutation({
    mutationFn: (input: NoticeInput) => Promise.resolve(createNotice(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setShowForm(null);
    },
  });

  const createOutageMutation = useMutation({
    mutationFn: (input: OutageInput) => Promise.resolve(createOutage(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outages'] });
      setShowForm(null);
    },
  });

  const updateNoticeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Notice> }) =>
      Promise.resolve(updateNotice(id, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      setEditingItem(null);
      setShowForm(null);
    },
  });

  const updateOutageMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Outage> }) =>
      Promise.resolve(updateOutage(id, updates)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outages'] });
      setEditingItem(null);
      setShowForm(null);
    },
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteNotice(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
  });

  const deleteOutageMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteOutage(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outages'] });
    },
  });

  const handleEdit = (item: Notice | Outage, type: FormMode) => {
    setEditingItem(item);
    setShowForm(type);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notices & Outages</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm('notice');
            }}
            className="btn-primary"
          >
            + New Notice
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm('outage');
            }}
            className="btn-primary"
          >
            + New Outage
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          {showForm === 'notice' ? (
            <NoticeForm
              properties={properties}
              editingNotice={editingItem as Notice}
              onSubmit={(input) => {
                if (editingItem) {
                  updateNoticeMutation.mutate({
                    id: editingItem.id,
                    updates: input as Partial<Notice>,
                  });
                } else {
                  createNoticeMutation.mutate(input);
                }
              }}
              onCancel={() => {
                setShowForm(null);
                setEditingItem(null);
              }}
            />
          ) : (
            <OutageForm
              properties={properties}
              editingOutage={editingItem as Outage}
              onSubmit={(input) => {
                if (editingItem) {
                  updateOutageMutation.mutate({
                    id: editingItem.id,
                    updates: input as Partial<Outage>,
                  });
                } else {
                  createOutageMutation.mutate(input);
                }
              }}
              onCancel={() => {
                setShowForm(null);
                setEditingItem(null);
              }}
            />
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Notices ({allNotices.length})</h2>
          <div className="space-y-4">
            {allNotices.map((notice) => (
              <div key={notice.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Property: {notice.propertyId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="badge bg-forest-100 text-forest-800">Pinned</span>
                    )}
                    <button
                      onClick={() => handleEdit(notice, 'notice')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this notice?')) {
                          deleteNoticeMutation.mutate(notice.id);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{notice.bodyMarkdown}</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(notice.startsAt)} → {formatDateTime(notice.endsAt)}
                </p>
              </div>
            ))}
            {allNotices.length === 0 && <p className="text-gray-600">No notices.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Outages ({allOutages.length})</h2>
          <div className="space-y-4">
            {allOutages.map((outage) => (
              <div key={outage.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{outage.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Property: {outage.propertyId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        outage.status === 'Active'
                          ? 'bg-red-100 text-red-800'
                          : outage.status === 'Planned'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {outage.status}
                    </span>
                    <button
                      onClick={() => handleEdit(outage, 'outage')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this outage?')) {
                          deleteOutageMutation.mutate(outage.id);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{outage.bodyMarkdown}</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(outage.startsAt)} → {formatDateTime(outage.endsAt)}
                </p>
              </div>
            ))}
            {allOutages.length === 0 && <p className="text-gray-600">No outages.</p>}
          </div>
        </section>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 text-sm text-blue-800">
        <strong>localStorage Simulation:</strong> Changes are saved to your browser and will persist until cleared.
      </div>
    </div>
  );
}

interface NoticeFormProps {
  properties: Array<{ id: string; name: string }>;
  editingNotice: Notice | null;
  onSubmit: (input: NoticeInput) => void;
  onCancel: () => void;
}

function NoticeForm({ properties, editingNotice, onSubmit, onCancel }: NoticeFormProps) {
  const [formData, setFormData] = useState<NoticeInput>({
    title: editingNotice?.title || '',
    bodyMarkdown: editingNotice?.bodyMarkdown || '',
    startsAt: editingNotice?.startsAt || new Date().toISOString().slice(0, 16),
    endsAt: editingNotice?.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    isPinned: editingNotice?.isPinned || false,
    propertyIds: editingNotice ? [editingNotice.propertyId] : [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.bodyMarkdown || formData.propertyIds.length === 0) {
      alert('Please fill in all required fields and select at least one property.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingNotice ? 'Edit Notice' : 'Create New Notice'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="label">Title*</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Message*</label>
          <textarea
            value={formData.bodyMarkdown}
            onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
            rows={4}
            className="textarea"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date & Time*</label>
            <input
              type="datetime-local"
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">End Date & Time*</label>
            <input
              type="datetime-local"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Properties* (Select one or more)</label>
          <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
            {properties.map((property) => (
              <label key={property.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.propertyIds.includes(property.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        propertyIds: [...formData.propertyIds, property.id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        propertyIds: formData.propertyIds.filter((id) => id !== property.id),
                      });
                    }
                  }}
                  disabled={!!editingNotice}
                  className="rounded"
                />
                <span className="text-sm">{property.name}</span>
              </label>
            ))}
          </div>
          {editingNotice && (
            <p className="text-xs text-gray-500 mt-1">Property cannot be changed when editing.</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">Pin this notice (show at top)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="btn-primary">
          {editingNotice ? 'Update Notice' : 'Create Notice'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

interface OutageFormProps {
  properties: Array<{ id: string; name: string }>;
  editingOutage: Outage | null;
  onSubmit: (input: OutageInput) => void;
  onCancel: () => void;
}

function OutageForm({ properties, editingOutage, onSubmit, onCancel }: OutageFormProps) {
  const [formData, setFormData] = useState<OutageInput>({
    title: editingOutage?.title || '',
    bodyMarkdown: editingOutage?.bodyMarkdown || '',
    startsAt: editingOutage?.startsAt || new Date().toISOString().slice(0, 16),
    endsAt: editingOutage?.endsAt || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: editingOutage?.status || 'Planned',
    propertyIds: editingOutage ? [editingOutage.propertyId] : [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.bodyMarkdown || formData.propertyIds.length === 0) {
      alert('Please fill in all required fields and select at least one property.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingOutage ? 'Edit Outage' : 'Create New Outage'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="label">Title*</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Description*</label>
          <textarea
            value={formData.bodyMarkdown}
            onChange={(e) => setFormData({ ...formData, bodyMarkdown: e.target.value })}
            rows={4}
            className="textarea"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date & Time*</label>
            <input
              type="datetime-local"
              value={formData.startsAt}
              onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">End Date & Time*</label>
            <input
              type="datetime-local"
              value={formData.endsAt}
              onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
              className="input"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Status*</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as OutageStatus })}
            className="select"
            required
          >
            <option value="Planned">Planned</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="label">Properties* (Select one or more)</label>
          <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
            {properties.map((property) => (
              <label key={property.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.propertyIds.includes(property.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        propertyIds: [...formData.propertyIds, property.id],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        propertyIds: formData.propertyIds.filter((id) => id !== property.id),
                      });
                    }
                  }}
                  disabled={!!editingOutage}
                  className="rounded"
                />
                <span className="text-sm">{property.name}</span>
              </label>
            ))}
          </div>
          {editingOutage && (
            <p className="text-xs text-gray-500 mt-1">Property cannot be changed when editing.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" className="btn-primary">
          {editingOutage ? 'Update Outage' : 'Create Outage'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
