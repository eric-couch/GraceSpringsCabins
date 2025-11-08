import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../../lib/api';
import { mergeTicketsWithOverlay } from '../../lib/localSim';
import { getCurrentUserId } from '../../lib/authSim';
import { getRelativeTime } from '../../lib/utils';
import type { TicketPriority, TicketStatus } from '../../types/models';

const priorityColors: Record<TicketPriority, string> = {
  Low: 'bg-gray-100 text-gray-800',
  Medium: 'bg-blue-100 text-blue-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColors: Record<TicketStatus, string> = {
  Open: 'bg-yellow-100 text-yellow-800',
  Assigned: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
};

export default function MyTicketsWidget() {
  const userId = getCurrentUserId();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['myTickets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const baseTickets = await getMyTickets(userId);
      return mergeTicketsWithOverlay(baseTickets);
    },
    enabled: !!userId,
  });

  const openTickets = tickets.filter(
    (t) => t.status !== 'Resolved' && t.status !== 'Closed'
  );

  if (isLoading) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">My Open Tickets</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Open Tickets</h2>
        <Link to="/maintenance/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          + New Ticket
        </Link>
      </div>

      {openTickets.length === 0 ? (
        <p className="text-gray-600">No open tickets.</p>
      ) : (
        <div className="space-y-3">
          {openTickets.slice(0, 3).map((ticket) => (
            <Link
              key={ticket.id}
              to={`/maintenance/${ticket.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {ticket.category} - {ticket.subcategory}
                </h3>
                <div className="flex gap-2">
                  <span className={`badge ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className={`badge ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {ticket.description}
              </p>
              <p className="text-xs text-gray-500">
                {getRelativeTime(ticket.createdAt)}
              </p>
            </Link>
          ))}
          {openTickets.length > 3 && (
            <Link
              to="/maintenance"
              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
            >
              View all tickets →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
