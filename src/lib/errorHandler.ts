import { isAxiosError } from 'axios';

export const errorHandler = (error: unknown) => {
  console.error('Error:', error);
  if (isAxiosError(error)) {
    console.error('Axios error:', error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
    }
  }
}