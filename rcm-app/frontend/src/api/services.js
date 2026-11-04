import client from './client';

export const authApi = {
  login: (payload) => client.post('/auth/login', payload).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data.user),
};

export const dashboardApi = {
  get: (days) => client.get('/dashboard', { params: { days } }).then((r) => r.data),
};

export const lookupApi = {
  get: () => client.get('/lookups').then((r) => r.data),
};

export const claimsApi = {
  list: (params) => client.get('/claims', { params }).then((r) => r.data),
  get: (id) => client.get(`/claims/${id}`).then((r) => r.data.data),
  export: (params) => client.get('/claims/export', { params, responseType: 'blob' }),
};
