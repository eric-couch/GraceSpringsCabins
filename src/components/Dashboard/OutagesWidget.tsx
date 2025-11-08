import { useQuery } from '@tanstack/react-query';
import { getActiveOutages } from '../../lib/api';
import { getCurrentPropertyId } from '../../lib/authSim';
import { formatDateTime, isDateRangeActive } from '../../lib/utils';

export default function OutagesWidget() {
  const propertyId = getCurrentPropertyId();

  const { data: outages = [], isLoading } = useQuery({
    queryKey: ['outages', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      return getActiveOutages(propertyId);
    },
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Scheduled Outages</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (outages.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Scheduled Outages</h2>
        <p className="text-gray-600">No scheduled outages at this time.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Scheduled Outages</h2>
      <div className="space-y-4">
        {outages.map((outage) => {
          const isActive = isDateRangeActive(outage.startsAt, outage.endsAt);
          return (
            <div
              key={outage.id}
              className="border-l-4 border-orange-500 pl-4 py-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-gray-900">{outage.title}</h3>
                {isActive && (
                  <span className="badge bg-orange-100 text-orange-800">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatDateTime(outage.startsAt)} -{' '}
                {formatDateTime(outage.endsAt)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
