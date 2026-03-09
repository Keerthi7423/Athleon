import axios from 'axios';

// Ensure the backend url matches the node.js microservice port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getPlayerAnalytics = async (id) => {
    const { data } = await apiClient.get(`/analytics/player/${id}`);
    return data;
};

export const getMatchAnalytics = async (id) => {
    const { data } = await apiClient.get(`/analytics/match/${id}`);
    return data;
};

export const getTeamAnalytics = async (id) => {
    const { data } = await apiClient.get(`/analytics/team/${id}`);
    return data;
};
