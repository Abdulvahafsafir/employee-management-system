import axios from "axios";

const api = axios.create({
  baseURL: "https://employee-management-system-api-b40f.onrender.com",
});

export default api;