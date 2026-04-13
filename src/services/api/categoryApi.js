import client from '../http/client';

export const categoryApi = {
  getAll: () => client.get('/categories'),
};
