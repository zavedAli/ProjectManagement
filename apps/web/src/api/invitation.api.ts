import { apiClient } from './client';

export const invitationApi = {
  sendInvitation: async (workspaceId: string, email: string, role: string) => {
    const { data } = await apiClient.post(`/workspaces/${workspaceId}/invitations`, { email, role });
    return data;
  },

  acceptInvitation: async (token: string) => {
    const { data } = await apiClient.post('/invitations/accept', { token });
    return data;
  },

  getInvitations: async (workspaceId: string) => {
    const { data } = await apiClient.get(`/workspaces/${workspaceId}/invitations`);
    return data;
  },

  revokeInvitation: async (invitationId: string) => {
    await apiClient.delete(`/invitations/${invitationId}`);
  },
};
