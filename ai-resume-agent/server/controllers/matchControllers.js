const { analyzeWithOpenAI } = require('../services/llmService');

/**
 * POST /api/match/match-job
 * Body — any of these (keys are always resumeText & jobDescription):
 * - JSON: { "resumeText": "...", "jobDescription": "..." } — multi-line JD must escape as \\n in JSON strings
 * - x-www-form-urlencoded: plain text fields — multi-line paste is OK
 * - multipart/form-data (no files): two text fields — multi-line paste is OK
 *
 * Uses OpenAI / OpenRouter (OPENAI_* env vars) via services/llmService.js.
 * 
 */
const cleanText = (text) =>
    text
      .replace(/\s+/g, " ")   // remove extra spaces/newlines
      .trim()
      .slice(0, 12000);       // limit token size
const matchResumeToJob = async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    let resumeText = body.resumeText;
    let jobDescription = body.jobDescription;

    resumeText =
      typeof resumeText === 'string'
        ? resumeText.trim()
        : resumeText !== undefined && resumeText !== null
          ? String(resumeText)
          : '';
    jobDescription =
      typeof jobDescription === 'string'
        ? jobDescription.trim()
        : jobDescription !== undefined && jobDescription !== null
          ? String(jobDescription)
          : '';

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        status: '400',
        message:
          'Both resumeText and jobDescription are required as non-empty strings. For pasted multi-line text, use Body → form-data or x-www-form-urlencoded in Postman (not raw JSON) — or escape line breaks as \\n in JSON.',
        data: null,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey?.trim?.()) {
      return res.status(503).json({
        status: '503',
        message:
          'OPENAI_API_KEY is missing or blank in server/.env. Add your key (no quotes) and restart the server from the server folder so dotenv loads.',
        data: null,
      });
    }

    try {
        resumeText = cleanText(resumeText);
        jobDescription = cleanText(jobDescription);
      const data = await analyzeWithOpenAI(resumeText, jobDescription);
      return res.status(200).json({
        status: 'success',
        message: 'Match analysis completed',
        data,
      });
    } catch (llmErr) {
      console.error(
        'OpenAI match error:',
        llmErr.response?.data || llmErr.message
      );

      const msg =
        typeof llmErr.message === 'string'
          ? llmErr.message
          : 'OpenAI analysis failed';

      if (msg.includes('OPENAI_API_KEY')) {
        return res.status(503).json({
          status: '503',
          message:
            'OPENAI_API_KEY is invalid or missing. Update server/.env and restart from the server directory.',
          data: null,
        });
      }

      const clientLike =
        /401|incorrect api key|invalid api key/i.test(msg) ||
        llmErr.response?.status === 401;

      const rateLike =
        /429|rate limit/i.test(msg) || llmErr.response?.status === 429;

      if (clientLike) {
        return res.status(401).json({
          status: '401',
          message:
            'OpenAI rejected the request (check API key or account access).',
          data: null,
        });
      }

      if (rateLike) {
        return res.status(429).json({
          status: '429',
          message: 'OpenAI rate limited this request — try again shortly.',
          data: null,
        });
      }

      return res.status(502).json({
        status: '502',
        message: msg,
        data: null,
      });
    }
  } catch (error) {
    console.error(
      'Match analysis error (unexpected):',
      error?.message || error,
      error?.stack
    );
    return res.status(500).json({
      status: '500',
      message:
        error?.message && process.env.NODE_ENV !== 'production'
          ? `Unexpected error: ${error.message}`
          : 'Failed to analyze resume and job description match',
      data: null,
    });
  }
};

module.exports = matchResumeToJob;
