// src/api.ts - Frontend API Integration
const API_BASE_URL = 'http://localhost:5000';

// Test the connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    const data = await response.json();
    return { success: true, ...data };
  } catch (error: any) {
    console.error('Connection test failed:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

// Upload Excel files
export const uploadExcelFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  try {
    const response = await fetch(`${API_BASE_URL}/api/upload/excel`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown error' };
  }
};

console.log('API module loaded - ready to connect to backend!');
