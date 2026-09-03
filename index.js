require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const app = express();
const PORT = 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.get('/jobs', async (req, res) => {
  try {
    const response = await fetch('https://remoteok.com/api');
    const data = await response.json();
    const jobs = data.slice(1);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});
app.post('/match', express.json(), async (req, res) => {
  try {
    const { resumeText, job } = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `You are a resume-job matching assistant.
Resume:
${resumeText}

Job Title: ${job.position}
Company: ${job.company}
Job Description: ${job.description}

Rate this match from 0-100 and explain why in 2-3 sentences.
Respond in this exact format:
Score: [number]
Reason: [explanation]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ result: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
