# 🤖 AI Resume Analyzer

An AI-powered web application that analyzes resumes and provides actionable feedback to improve ATS compatibility and job alignment.

> Built to help developers optimize resumes for better recruiter visibility using Generative AI.

---

## 🚀 Features

- 📄 Upload and analyze resumes instantly  
- 🧠 AI-powered feedback using LLMs  
- 🎯 ATS compatibility analysis  
- 🧾 Section-wise suggestions (skills, experience, formatting)  
- ⚡ Real-time processing with efficient API integration  

---

## 🛠️ Tech Stack

**Frontend:** React.js  
**Backend:** Node.js, Express  
**AI Integration:** OpenAI API (LLMs)  
**Other:** REST APIs  

---

## 💡 How It Works

1. User uploads or inputs resume content  
2. Backend processes and structures the data  
3. AI model analyzes content using prompt engineering  
4. Returns feedback on:
   - Resume structure  
   - Job-description alignment  
   - Improvement suggestions  

---
## Installations
1) Take a pull.
2) cd server npm install
3) cd client npm install
4) After setup navigate to client and run npm start to start the react server
5) Navigate to server and run 'npm run dev' to run the backend server
## 🔑 Environment Variables

Create a `.env` file in the root directory and add:

```env
NODE_ENV=development
PORT=5000

OPENAI_API_KEY=YOUR_API_KEY
OPENAI_API_URL=https://openrouter.ai/api/v1/chat/completions OR ANY OTHER API URL

OPENAI_MODEL=meta-llama/llama-3-8b-instruct
