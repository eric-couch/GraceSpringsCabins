import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProperties, getCabins, getUsers } from '../lib/api';
import { getSession, setSession } from '../lib/authSim';
import RoleBadge from '../components/RoleBadge';
import type { UserRole } from '../types/models';

export default function Profile() {
  const session = getSession();
  const [selectedRole, setSelectedRole] = useState<UserRole>(session?.role || 'Renter');
  const [selectedUserId, setSelectedUserId] = useState(session?.userId || '');
  const [selectedPropertyId, setSelectedPropertyId] = useState(session?.propertyId || '');
  const [selectedCabinId, setSelectedCabinId] = useState(session?.cabinId || '');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const { data: cabins = [] } = useQuery({
    queryKey: ['cabins'],
    queryFn: getCabins,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const filteredUsers = users.filter((u) => u.role === selectedRole);
  const filteredCabins = cabins.filter((c) => c.propertyId === selectedPropertyId);
  const selectedUser = users.find((u) => u.id === selectedUserId);

  useEffect(() => {
    if (filteredUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedUserId]);

  // Auto-set cabin when user is selected
  useEffect(() => {
    if (selectedUser) {
      setSelectedCabinId(selectedUser.cabinId || '');
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedRole !== 'Renter') {
      setSelectedCabinId('');
    }
  }, [selectedRole]);

  const handleSave = () => {
    setSession({
      role: selectedRole,
      userId: selectedUserId,
      propertyId: selectedPropertyId,
      cabinId: selectedRole === 'Renter' ? selectedCabinId : null,
    });
    window.location.href = import.meta.env.BASE_URL;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Manage your preferences and simulation settings.
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Session
        </h2>
        {session ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Role:</span>
              <RoleBadge role={session.role} />
            </div>
            <div>
              <span className="text-gray-600">User ID:</span>{' '}
              <span className="font-mono text-gray-900">{session.userId}</span>
            </div>
            <div>
              <span className="text-gray-600">Property:</span>{' '}
              <span className="text-gray-900">{session.propertyId}</span>
            </div>
            {session.cabinId && (
              <div>
                <span className="text-gray-600">Cabin:</span>{' '}
                <span className="text-gray-900">{session.cabinId}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No active session.</p>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Role Simulator
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Switch between roles to explore different features. This is for demonstration purposes only.
        </p>

        <div className="space-y-4">
          <div>
            <label className="label">Role</label>
            <select
              className="select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <option value="Renter">Renter</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="label">User</label>
            <select
              className="select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select a user</option>
              {filteredUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Property</label>
            <select
              className="select"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <option value="">Select a property</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>

          {selectedRole === 'Renter' && (
            <div>
              <label className="label">Cabin (assigned to user)</label>
              <select
                className="select bg-gray-100"
                value={selectedCabinId}
                onChange={(e) => setSelectedCabinId(e.target.value)}
                disabled
              >
                <option value="">No cabin assigned</option>
                {filteredCabins.map((cabin) => (
                  <option key={cabin.id} value={cabin.id}>
                    {cabin.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Each user is assigned to one cabin. Change user data to modify cabin assignments.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={!selectedUserId || !selectedPropertyId || (selectedRole === 'Renter' && !selectedCabinId)}
            >
              Apply Changes & Reload
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Note:</strong> This role switcher is for demonstration purposes. In production, roles would be managed through proper authentication and authorization.
      </div>
    </div>
  );
}
