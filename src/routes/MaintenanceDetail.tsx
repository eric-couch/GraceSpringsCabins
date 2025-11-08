import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTicket, getUser } from '../lib/api';
import { mergeTicketsWithOverlay } from '../lib/localSim';
import { formatDateTime } from '../lib/utils';
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

export default function MaintenanceDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const baseTicket = await getTicket(ticketId);
      if (!baseTicket) return null;
      const merged = mergeTicketsWithOverlay([baseTicket]);
      return merged[0] || null;
    },
    enabled: !!ticketId,
  });

  const { data: assignedStaff } = useQuery({
    queryKey: ['user', ticket?.assignedToUserId],
    queryFn: () => getUser(ticket!.assignedToUserId!),
    enabled: !!ticket?.assignedToUserId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-600">Ticket not found.</p>
          <Link to="/maintenance" className="text-primary-600 mt-4 inline-block">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link
          to="/maintenance"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          ← Back to My Tickets
        </Link>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {ticket.category} - {ticket.subcategory}
            </h1>
            <p className="text-sm text-gray-600">Ticket #{ticket.id}</p>
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

        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Description
            </h3>
            <p className="text-gray-900">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Created
              </h3>
              <p className="text-gray-900">{formatDateTime(ticket.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </h3>
              <p className="text-gray-900">{formatDateTime(ticket.updatedAt)}</p>
            </div>
          </div>

          {assignedStaff && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </h3>
              <p className="text-gray-900">{assignedStaff.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Note:</strong> Ticket updates and comments will be added in a future version. This is a read-only view.
      </div>
    </div>
  );
}
