import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUsers, getProperties, getCabins } from '../lib/api';
import { mergeUsersWithOverlay, createUser, revokeUserAccess, deleteUser, getSignupUrl } from '../lib/localSim';
import RoleBadge from '../components/RoleBadge';
import type { UserRole, User } from '../types/models';
import QRCode from 'qrcode';

export default function AdminUsers() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Renter');
  const [newUserPropertyId, setNewUserPropertyId] = useState('');
  const [newUserCabinId, setNewUserCabinId] = useState('');
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [conflictingUser, setConflictingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToRevoke, setUserToRevoke] = useState<User | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: baseUsers = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const users = mergeUsersWithOverlay(baseUsers);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const { data: cabins = [] } = useQuery({
    queryKey: ['cabins'],
    queryFn: getCabins,
  });

  const filteredCabins = cabins.filter((c) => c.propertyId === newUserPropertyId);

  // Generate QR code when user is created
  useEffect(() => {
    if (createdUser && createdUser.signupToken && canvasRef.current) {
      const signupUrl = getSignupUrl(createdUser.signupToken);
      QRCode.toCanvas(canvasRef.current, signupUrl, { width: 256 }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
      setQrCodeUrl(signupUrl);
    }
  }, [createdUser]);

  const createUserMutation = useMutation({
    mutationFn: async () => {
      // Check if cabin is already assigned
      if (newUserCabinId) {
        const existingUser = users.find(
          (u) => u.cabinId === newUserCabinId && u.isActive !== false
        );
        if (existingUser) {
          setConflictingUser(existingUser);
          throw new Error('Cabin already assigned');
        }
      }

      const user = createUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        propertyId: newUserPropertyId,
        cabinId: newUserRole === 'Renter' ? newUserCabinId : null,
      });
      return user;
    },
    onSuccess: (user) => {
      setCreatedUser(user);
      refetch();
      // Clear form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserCabinId('');
    },
    onError: (error: Error) => {
      if (error.message !== 'Cabin already assigned') {
        alert('Failed to create user');
      }
    },
  });

  const revokeAndCreateMutation = useMutation({
    mutationFn: async () => {
      if (!conflictingUser) throw new Error('No conflicting user');
      
      // Revoke the conflicting user's access
      revokeUserAccess(conflictingUser.id);
      
      // Create the new user
      const user = createUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        propertyId: newUserPropertyId,
        cabinId: newUserRole === 'Renter' ? newUserCabinId : null,
      });
      return user;
    },
    onSuccess: (user) => {
      setCreatedUser(user);
      setConflictingUser(null);
      refetch();
      // Clear form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserCabinId('');
    },
  });

  const handleCreateUser = () => {
    createUserMutation.mutate();
  };

  const handleRevokeAndCreate = () => {
    revokeAndCreateMutation.mutate();
  };

  const handleCloseCreated = () => {
    setCreatedUser(null);
    setQrCodeUrl('');
    setShowCreateForm(false);
  };

  const revokeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      revokeUserAccess(userId);
    },
    onSuccess: () => {
      setUserToRevoke(null);
      refetch();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      deleteUser(userId);
    },
    onSuccess: () => {
      setUserToDelete(null);
      refetch();
    },
  });

  const handleRevoke = (user: User) => {
    setUserToRevoke(user);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmRevoke = () => {
    if (userToRevoke) {
      revokeUserMutation.mutate(userToRevoke.id);
    }
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-8"><p>Loading...</p></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && !createdUser && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                className="input"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                className="input"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="label">Role *</label>
              <select
                className="select"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              >
                <option value="Renter">Renter</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Property *</label>
              <select
                className="select"
                value={newUserPropertyId}
                onChange={(e) => setNewUserPropertyId(e.target.value)}
              >
                <option value="">Select a property</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>
            {newUserRole === 'Renter' && newUserPropertyId && (
              <div>
                <label className="label">Cabin *</label>
                <select
                  className="select"
                  value={newUserCabinId}
                  onChange={(e) => setNewUserCabinId(e.target.value)}
                >
                  <option value="">Select a cabin</option>
                  {filteredCabins.map((cabin) => (
                    <option key={cabin.id} value={cabin.id}>
                      {cabin.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="btn-primary"
                disabled={
                  !newUserEmail ||
                  !newUserName ||
                  !newUserPropertyId ||
                  (newUserRole === 'Renter' && !newUserCabinId) ||
                  createUserMutation.isPending
                }
              >
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Created User with QR Code */}
      {createdUser && (
        <div className="card p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-green-900">✅ User Created Successfully</h2>
            <button
              onClick={handleCloseCreated}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{createdUser.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{createdUser.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Role:</span>
                <div className="mt-1">
                  <RoleBadge role={createdUser.role} />
                </div>
              </div>
              {createdUser.cabinId && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Cabin:</span>
                  <p className="text-gray-900">{createdUser.cabinId}</p>
                </div>
              )}
              <div className="pt-4">
                <span className="text-sm font-medium text-gray-700">Signup URL:</span>
                <div className="mt-1 p-3 bg-white rounded border break-all text-sm font-mono">
                  {qrCodeUrl}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(qrCodeUrl)}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700 mt-2"
                >
                  📋 Copy URL
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 mb-3">Scan QR Code to Sign Up</p>
              <canvas ref={canvasRef} className="border-4 border-white shadow-lg rounded" />
              <p className="text-xs text-gray-600 mt-3 text-center">
                Share this QR code with the user to complete their signup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cabin Conflict Modal */}
      {conflictingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Cabin Already Assigned</h3>
            <p className="text-gray-700 mb-4">
              Cabin <strong>{newUserCabinId}</strong> is currently assigned to:
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="font-medium text-gray-900">{conflictingUser.name}</p>
              <p className="text-sm text-gray-600">{conflictingUser.email}</p>
            </div>
            <p className="text-gray-700 mb-6">
              Do you want to <strong>revoke access</strong> for {conflictingUser.name} and assign this cabin to the new user?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConflictingUser(null);
                  createUserMutation.reset();
                }}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeAndCreate}
                className="btn bg-red-600 text-white hover:bg-red-700"
                disabled={revokeAndCreateMutation.isPending}
              >
                {revokeAndCreateMutation.isPending ? 'Processing...' : 'Revoke & Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cabin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.isActive === false ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.cabinId
                    ? user.cabinId.replace('C-', '')
                    : '—'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {user.isActive === false ? (
                    <span className="badge bg-red-100 text-red-800">Revoked</span>
                  ) : user.signupToken && !user.isActive ? (
                    <span className="badge bg-yellow-100 text-yellow-800">Pending</span>
                  ) : (
                    <span className="badge bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    {user.isActive !== false && (
                      <button
                        onClick={() => handleRevoke(user)}
                        className="btn btn-sm bg-amber-600 text-white hover:bg-amber-700"
                        title="Revoke user access"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user)}
                      className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                      title="Delete user permanently"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 text-sm text-blue-800">
        <strong>Note:</strong> Users marked as "Pending" have been created but haven't completed signup. "Revoked" users have had their access removed.
      </div>

      {/* Revoke Confirmation Modal */}
      {userToRevoke && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-amber-900 mb-4">⚠️ Revoke User Access</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to revoke access for:
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="font-medium text-gray-900">{userToRevoke.name}</p>
              <p className="text-sm text-gray-600">{userToRevoke.email}</p>
              {userToRevoke.cabinId && (
                <p className="text-sm text-gray-600 mt-1">Cabin: {userToRevoke.cabinId}</p>
              )}
            </div>
            <p className="text-gray-700 mb-6">
              This will set their status to "Revoked" and remove their cabin assignment. They will no longer be able to access the site.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUserToRevoke(null)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                className="btn bg-amber-600 text-white hover:bg-amber-700"
                disabled={revokeUserMutation.isPending}
              >
                {revokeUserMutation.isPending ? 'Revoking...' : 'Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-900 mb-4">🗑️ Delete User</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to permanently delete:
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p className="font-medium text-gray-900">{userToDelete.name}</p>
              <p className="text-sm text-gray-600">{userToDelete.email}</p>
              {userToDelete.cabinId && (
                <p className="text-sm text-gray-600 mt-1">Cabin: {userToDelete.cabinId}</p>
              )}
            </div>
            <p className="text-red-700 font-medium mb-6">
              ⚠️ This action cannot be undone. The user will be completely removed from the system.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUserToDelete(null)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-600 text-white hover:bg-red-700"
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
