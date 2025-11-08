import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TicketForm from '../components/TicketForm';
import { createTicket } from '../lib/localSim';
import { getCurrentPropertyId, getCurrentCabinId } from '../lib/authSim';
import type { TicketInput } from '../types/models';

export default function MaintenanceNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const propertyId = getCurrentPropertyId();
  const cabinId = getCurrentCabinId();

  const mutation = useMutation({
    mutationFn: (input: TicketInput) => {
      const ticket = createTicket(input);
      return Promise.resolve(ticket);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      navigate('/maintenance');
    },
  });

  if (!propertyId || !cabinId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-600">
            Please configure your property and cabin in your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Maintenance Request
        </h1>
        <p className="text-gray-600">
          Let us know about any issues you're experiencing.
        </p>
      </div>

      <div className="card p-6">
        <TicketForm
          onSubmit={(input) => mutation.mutate(input)}
          propertyId={propertyId}
          cabinId={cabinId}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  );
}
