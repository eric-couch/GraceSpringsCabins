import type { UserRole } from '../types/models';

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const colors = {
    Renter: 'bg-blue-100 text-blue-800',
    Staff: 'bg-green-100 text-green-800',
    Admin: 'bg-purple-100 text-purple-800',
  };

  return <span className={`badge ${colors[role]}`}>{role}</span>;
}
