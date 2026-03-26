import axios from 'axios';
import BASE_URL from './config';

export const shortenUrl = async (originalUrl, expiryDays = 30, customCode = '') => {
    const payload = { originalUrl, expiryDays };
    if (customCode && customCode.trim()) payload.customCode = customCode.trim();
    const response = await axios.post(`${BASE_URL}/shorten`, payload);
    return response.data;
};

export const getAllUrls = async () => {
    const response = await axios.get(`${BASE_URL}/urls`);
    return response.data;
};

export const deleteUrl = async (id) => {
    await axios.delete(`${BASE_URL}/urls/${id}`);
};

export const getAnalytics = async () => {
    const response = await axios.get(`${BASE_URL}/analytics`);
    return response.data;
};
