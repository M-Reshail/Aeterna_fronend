import api from './api';

export const feedbackService = {
  submitFeedback: async ({ alertId, userId, sentiment, comment = '' }) => {
    const existing = await api.get('/feedback', {
      params: { alertId, userId },
    });

    if (Array.isArray(existing.data) && existing.data.length > 0) {
      throw new Error('Feedback already submitted for this alert');
    }

    const response = await api.post('/feedback', {
      alertId,
      userId,
      sentiment,
      comment,
      createdAt: new Date().toISOString(),
    });

    return response.data;
  },
};

export default feedbackService;
