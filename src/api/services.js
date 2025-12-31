import apiClient from './client';

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  registerAdmin: async (userData) => {
    const response = await apiClient.post('/auth/register-admin', userData);
    return response.data;
  },
};

// Building Services
export const buildingService = {
  getAll: async () => {
    const response = await apiClient.get('/buildings/');
    return response.data;
  },
  create: async (buildingData) => {
    const response = await apiClient.post('/buildings/', buildingData);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/buildings/${id}`);
    return response.data;
  },
  update: async (id, buildingData) => {
    const response = await apiClient.put(`/buildings/${id}`, buildingData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/buildings/${id}`);
    return response.data;
  },
  // Sub-resources
  getFloors: async (id) => {
    const response = await apiClient.get(`/buildings/${id}/floors`);
    return response.data;
  },
  getNodes: async (id) => {
    const response = await apiClient.get(`/buildings/${id}/nodes`);
    return response.data;
  },
  getEdges: async (id) => {
    const response = await apiClient.get(`/buildings/${id}/edges`);
    return response.data;
  },
  getGraph: async (id) => {
    const response = await apiClient.get(`/buildings/${id}/graph`);
    return response.data;
  },
};

// Floor Services
export const floorService = {
  create: async (floorData) => {
    const response = await apiClient.post('/floors/', floorData);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/floors/${id}`);
    return response.data;
  },
  update: async (id, floorData) => {
    const response = await apiClient.put(`/floors/${id}`, floorData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/floors/${id}`);
    return response.data;
  },
};

// Node Services
export const nodeService = {
  create: async (nodeData) => {
    const response = await apiClient.post('/nodes/', nodeData);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/nodes/${id}`);
    return response.data;
  },
  update: async (id, nodeData) => {
    const response = await apiClient.put(`/nodes/${id}`, nodeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/nodes/${id}`);
    return response.data;
  },
  getFingerprints: async (id) => {
    const response = await apiClient.get(`/nodes/${id}/fingerprints`);
    return response.data;
  },
};

// Edge Services
export const edgeService = {
  create: async (edgeData) => {
    const response = await apiClient.post('/edges/', edgeData);
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/edges/${id}`);
    return response.data;
  },
  update: async (id, edgeData) => {
    const response = await apiClient.put(`/edges/${id}`, edgeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/edges/${id}`);
    return response.data;
  },
};
