import { api } from './client';

export const getBooks = () => api.get('/books').then(r => r.data);
export const createBook = (payload) => api.post('/books', payload).then(r => r.data);
export const updateBook = (id, payload) => api.put(`/books/${id}`, payload).then(r => r.data);
export const deleteBook = (id) => api.delete(`/books/${id}`).then(r => r.data);