import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
});

// Upload resume file (expects FormData with 'resume')
export const uploadResume = async (formData) => {
  const response = await apiClient.post('/api/resume/analyze-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Match resume text against job description
export const matchJob = async (data) => {
  const response = await apiClient.post('/api/match/match-job', data);
  return response.data;
};