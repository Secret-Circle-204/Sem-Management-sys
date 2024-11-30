// تكوين عنوان API
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://sem-management-qorxjfrp7-secret-circles-projects-64e2307e.vercel.app/api'
  : 'http://localhost:5000/api';

export default API_BASE_URL;
