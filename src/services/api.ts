import axios from 'axios';
import { handleError } from '../lib/errorHandler';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    handleError(err);
    return Promise.reject(err);
  }
);

export default api;
