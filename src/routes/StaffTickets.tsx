import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnassignedTickets, getAssignedTickets } from '../lib/api';
import { getCurrentUserId, getCurrentPropertyId } from '../lib/authSim';
import { mergeTicketsWithOverlay } from '../lib/localSim';
import { getRelativeTime } from '../lib/utils';
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

export default function StaffTickets() {
  const userId = getCurrentUserId();
  const propertyId = getCurrentPropertyId();

  const { data: unassignedTickets = [] } = useQuery({
    queryKey: ['unassignedTickets', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      const tickets = await getUnassignedTickets(propertyId);
      return mergeTicketsWithOverlay(tickets);
    },
    enabled: !!propertyId,
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['assignedTickets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const tickets = await getAssignedTickets(userId);
      return mergeTicketsWithOverlay(tickets);
    },
    enabled: !!userId,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tickets Queue</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Unassigned ({unassignedTickets.length})
          </h2>
          <div className="grid gap-4">
            {unassignedTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/staff/tickets/${ticket.id}`}
                className="card p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {ticket.category} - {ticket.subcategory}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`badge ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {ticket.description}
                </p>
                <p className="text-xs text-gray-500">
                  Cabin {ticket.cabinId.replace('C-', '')} • {getRelativeTime(ticket.createdAt)}
                </p>
              </Link>
            ))}
            {unassignedTickets.length === 0 && (
              <p className="text-gray-600">No unassigned tickets.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Assigned to Me ({myTickets.length})
          </h2>
          <div className="grid gap-4">
            {myTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/staff/tickets/${ticket.id}`}
                className="card p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
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
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {ticket.description}
                </p>
                <p className="text-xs text-gray-500">
                  Cabin {ticket.cabinId.replace('C-', '')} • {getRelativeTime(ticket.createdAt)}
                </p>
              </Link>
            ))}
            {myTickets.length === 0 && (
              <p className="text-gray-600">No assigned tickets.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
