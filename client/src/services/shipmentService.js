import API from './api';

const shipmentService = {
  // Get all shipments with query parameters
  getShipments: async (params = {}) => {
    const response = await API.get('/shipments', { params });
    return response.data;
  },

  // Get statistics for dashboard
  getShipmentStats: async (params = {}) => {
    const response = await API.get('/shipments/stats', { params });
    return response.data;
  },

  // Get single shipment by ID
  getShipmentById: async (id) => {
    const response = await API.get(`/shipments/${id}`);
    return response.data;
  },

  // Create new shipment with multipart/form-data for document upload
  createShipment: async (formData) => {
    const response = await API.post('/shipments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update existing shipment
  updateShipment: async (id, formData) => {
    const response = await API.put(`/shipments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete shipment
  deleteShipment: async (id) => {
    const response = await API.delete(`/shipments/${id}`);
    return response.data;
  },
};

export default shipmentService;
