import api from './client';

export const getDashboardData = async () => {
    const { data } = await api.get('/dashboard');
    return data;
};

