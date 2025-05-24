// src/services/axios.js

import axios from 'axios';

// Tạo một instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api/v1', // Đặt URL gốc của API backend
  timeout: 10000, // Timeout trong 10 giây nếu không có phản hồi từ server
  headers: {
    'Content-Type': 'application/json', // Đặt header cho tất cả các yêu cầu
    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Nếu cần dùng token
  },
});

export default axiosInstance;
