import React, { useState } from 'react';
import axios from 'axios';

const ResumeUpload = ({ setResult, setLoading }) => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit');   

    // Validate fields
    if (!file) {
      alert('Please upload a PDF resume.');
      return;
    }
    if (!jobDescription.trim()) {
      alert('Please enter the job description.');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      // 1. Upload resume file
      const formData = new FormData();
      formData.append('resume', file);

      const resumeResponse = await axios.post(
        'http://localhost:5000/api/resume/analyze-resume',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('resumeResponse', resumeResponse);
      const resumeText = resumeResponse?.data?.data?.text;
      if (!resumeText) {
        throw new Error('Resume text extraction failed.');
      }

      // 2. Call match API
      const matchPayload = {
        resumeText,
        jobDescription,
      };

      const matchResponse = await axios.post(
        'http://localhost:5000/api/match/match-job',
        matchPayload
      );

      const resultData = matchResponse?.data?.data;
      setResult(resultData);
    } catch (err) {
      console.log('Error:', err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'An error occurred while analyzing the resume.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 24,
        border: '1px solid #eee',
        borderRadius: 8,
        boxShadow: '0 2px 8px #eee',
        background: '#fafbfc',
      }}
    >
      <div>
        <label>
          <strong>Upload Resume (PDF only):</strong>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'block', marginTop: 8 , fontSize: '12px'}}
            required
          />
        </label>
      </div>
      <div>
        <label>
          <strong>Job Description:</strong>
          <textarea
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            rows={7}
            style={{
              width: '100%',
              marginTop: 8,
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '12px',
              padding: 8,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
            placeholder="Paste the job description here..."
            required
          />
        </label>
      </div>
      <button
        type="submit"
        style={{
          background: '#2051f2',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '12px 0',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          cursor: 'pointer',
        }}
        disabled={!file || !jobDescription.trim()}
      >
        Analyze Resume
      </button>
    </form>
  );
};

export default ResumeUpload;