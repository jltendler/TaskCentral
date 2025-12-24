import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Hardcoded port for this simple demo, but this should be dynamic in a real situation.
    headers: {
        'Content-Type': 'application/json',
    },
});

export const todoListService = {
    getLists: () => api.get('/todolists'),
    getList: (id) => api.get(`/todolists/${id}`),
    createList: (data) => api.post('/todolists', data),
    updateList: (id, data) => api.put(`/todolists/${id}`, data),
    deleteList: (id) => api.delete(`/todolists/${id}`),
};

export const todoItemService = {
    getItems: (listId) => api.get(`/todolists/${listId}/items`),
    getPriorityItems: () => api.get('/todoitems/priority'),
    getDueSoonItems: () => api.get('/todoitems/duesoon'),
    getOverdueItems: () => api.get('/todoitems/overdue'),
    createItem: (listId, data) => api.post(`/todolists/${listId}/items`, data),
    updateItem: (listId, itemId, data) => api.put(`/todolists/${listId}/items/${itemId}`, data),
    completeAll: (listId) => api.post(`/todolists/${listId}/items/complete-all`, {}),
    uncompleteAll: (listId) => api.post(`/todolists/${listId}/items/uncomplete-all`, {}),
    deleteItem: (listId, itemId) => api.delete(`/todolists/${listId}/items/${itemId}`),
};

export default api;
