import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyTickets } from '../lib/api';
import { mergeTicketsWithOverlay } from '../lib/localSim';
import { getCurrentUserId } from '../lib/authSim';
import { getRelativeTime } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import type { TicketPriority, TicketStatus } from '../types/models';

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

export default function MaintenanceMy() {
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Maintenance Tickets
          </h1>
          <p className="text-gray-600">View and track all your requests.</p>
        </div>
        <Link to="/maintenance/new" className="btn-primary">
          + New Ticket
        </Link>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No Tickets Yet"
          description="You haven't submitted any maintenance requests."
          actionLabel="Submit First Request"
          onAction={() => window.location.href = '/maintenance/new'}
        />
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/maintenance/${ticket.id}`}
              className="card p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {ticket.category} - {ticket.subcategory}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ticket #{ticket.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`badge ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                  <span className={`badge ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-2">
                {ticket.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created {getRelativeTime(ticket.createdAt)}</span>
                {ticket.assignedToUserId && (
                  <span>• Assigned to staff</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
