const axios = require('axios');

/**
 * Calls OpenAI Chat Completions to compare resume ↔ job description.
 *
 * Env: OPENAI_API_KEY (required), OPENAI_API_URL (optional),
 * OPENAI_MODEL (optional, default inexpensive model suitable for tier usage).
 *
 * @param {string} resumeText
 * @param {string} jobDescription
 * @param {number} [maxRetries=2]
 * @returns {Promise<{ match_score: number, summary: string, matching_skills: string[], missing_skills: string[], suggestions: string[] }>}
 */
async function analyzeWithOpenAI(resumeText, jobDescription, maxRetries = 2) {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl =
    process.env.OPENAI_API_URL ||
    'https://api.openai.com/v1/chat/completions';
  const model =
    process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  if (!(typeof apiKey === 'string' && apiKey.trim()))
    throw new Error('OPENAI_API_KEY env variable not set');

  const userPrompt = `
  You are a strict ATS system used by top tech companies like Google, Amazon, and Meta.
  
  You evaluate resumes in a HARD, UNFORGIVING way.
  
  Scoring rules:
  - Start from 100
  - Deduct heavily for missing REQUIRED skills
  - Deduct for weak/irrelevant project experience
  - Do NOT be lenient or encouraging
  - Most resumes should score between 40–85 unless truly exceptional
  
  Return ONLY raw JSON with double-quoted keys. No markdown, no code fences.
  
  Schema:
  {
    "match_score": <number 0-100 strict ATS score>,
    "summary": "<1 precise sentence describing hiring decision and key gaps>",
    "matching_skills": [strings],
    "missing_skills": [strings],
    "suggestions": [
      "Each suggestion MUST be specific to the user's resume content",
      "Mention exact project/experience from resume when possible",
      "Do NOT give generic advice like 'take courses'",
      "Focus on what to change in resume/projects to improve hiring chances"
    ]
  }
  
  STRICT RULES:
  - Suggestions must be actionable and resume-specific
  - Prefer: "Add X in your IndiaMART project showing Y"
  - Avoid: generic learning advice
  - Be realistic like an ATS used in top companies
  
  Resume:
  ${resumeText}
  
  Job description:
  ${jobDescription}
  `.trim();

  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      const response = await axios.post(
        apiUrl,
        {
          model,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.2,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 120000,
        }
      );

      let content =
        response.data.choices?.[0]?.message?.content?.trim?.() ?? '';
      // Strip Markdown code fence if present
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      try {
        const parsed = JSON.parse(jsonString);
        const summary =
          typeof parsed.summary === 'string'
            ? parsed.summary.trim()
            : parsed.summary !== undefined && parsed.summary !== null
              ? String(parsed.summary)
              : '';
        if (
          typeof parsed.match_score === 'number' &&
          Array.isArray(parsed.matching_skills) &&
          Array.isArray(parsed.missing_skills) &&
          Array.isArray(parsed.suggestions)
        ) {
          return {
            match_score: parsed.match_score,
            summary:
              summary ||
              'Brief fit summary unavailable — infer from scores and suggestions.',
            matching_skills: parsed.matching_skills,
            missing_skills: parsed.missing_skills,
            suggestions: parsed.suggestions,
          };
        }
        throw new Error('JSON does not have expected structure');
      } catch (jsonErr) {
        lastError = jsonErr;
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403 || status === 429) {
        const apiErr = err.response?.data?.error;
        const readable =
          (typeof apiErr?.message === 'string' && apiErr.message) ||
          err.message ||
          String(err);
        const definitive = new Error(readable);
        definitive.response = err.response;
        throw definitive;
      }
      const apiErr = err.response?.data?.error;
      const readable =
        (typeof apiErr?.message === 'string' && apiErr.message) ||
        err.message ||
        String(err);
      lastError = new Error(readable);
      lastError.response = err.response;
    }
    attempt++;
  }

  const aggregated = new Error(
    `Failed to get valid JSON from OpenAI after ${maxRetries + 1} attempt(s): ${
      lastError?.message || lastError
    }`
  );
  if (lastError?.response) aggregated.response = lastError.response;
  throw aggregated;
}

module.exports = { analyzeWithOpenAI };
