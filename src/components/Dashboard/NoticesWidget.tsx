import { useQuery } from '@tanstack/react-query';
import { getActiveNotices } from '../../lib/api';
import { getCurrentPropertyId } from '../../lib/authSim';

export default function NoticesWidget() {
  const propertyId = getCurrentPropertyId();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      return getActiveNotices(propertyId);
    },
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Community Notices</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (notices.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Community Notices</h2>
        <p className="text-gray-600">No active notices at this time.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Community Notices</h2>
      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`border-l-4 pl-4 py-2 ${
              notice.isPinned ? 'border-primary-500' : 'border-blue-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900">{notice.title}</h3>
              {notice.isPinned && (
                <span className="badge bg-primary-100 text-primary-800">
                  Pinned
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notice.bodyMarkdown.split('\n')[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
