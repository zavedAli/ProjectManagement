import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '../../api/invitation.api';

interface WorkspaceInvitationsProps {
  workspaceId: string;
}

export const WorkspaceInvitations = ({ workspaceId }: WorkspaceInvitationsProps) => {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [showForm, setShowForm] = useState(false);

  const { data: invitations } = useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: () => invitationApi.getInvitations(workspaceId),
  });

  const sendInvite = useMutation({
    mutationFn: () => invitationApi.sendInvitation(workspaceId, email, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', workspaceId] });
      setEmail('');
      setRole('member');
      setShowForm(false);
    },
  });

  const revokeInvite = useMutation({
    mutationFn: (id: string) => invitationApi.revokeInvitation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations', workspaceId] });
    },
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Workspace Invitations</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Invite Member
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendInvite.mutate();
          }}
          className="mb-6 p-4 bg-gray-50 rounded-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={sendInvite.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {sendInvite.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {invitations?.map((inv: any) => (
          <div key={inv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div>
              <p className="font-medium">{inv.email}</p>
              <p className="text-sm text-gray-500">
                Role: {inv.role} • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => revokeInvite.mutate(inv.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Revoke
            </button>
          </div>
        ))}
        {invitations?.length === 0 && (
          <p className="text-gray-500 text-center py-4">No pending invitations</p>
        )}
      </div>
    </div>
  );
};
