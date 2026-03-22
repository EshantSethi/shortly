import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export const shortenUrl = async (originalUrl, expiryDays = 30) => {
    const response = await axios.post(`${BASE_URL}/shorten`, {
        originalUrl,
        expiryDays
    });
    return response.data;
};

export const getAllUrls = async () => {
    const response = await axios.get(`${BASE_URL}/urls`);
    return response.data;
};