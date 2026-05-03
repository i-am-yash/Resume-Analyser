const { PDFParse } = require('pdf-parse');

const sendResumeResponse = (res, httpStatus, message, data = null) => {
  return res.status(httpStatus).json({
    status: String(httpStatus),
    message,
    data,
  });
};

const analyzeResume = async (req, res) => {
  try {
    const uploaded = req.file;

    if (!uploaded) {
      return sendResumeResponse(
        res,
        400,
        'No file uploaded — send multipart/form-data with one file field named "resume".',
        null
      );
    }

    // Get the file buffer
    const fileBuffer = uploaded.buffer || null;

    // If Multer is not configured for memoryStorage, read the file from disk
    let bufferToParse;
    if (fileBuffer) {
      bufferToParse = fileBuffer;
    } else if (uploaded.path) {
      // Fallback: read from disk using fs
      const fs = require('fs').promises;
      bufferToParse = await fs.readFile(uploaded.path);
    } else {
      return sendResumeResponse(
        res,
        400,
        'Uploaded file could not be processed',
        null
      );
    }

    // pdf-parse v2 API (v1's pdf(buffer) no longer exists)
    const parser = new PDFParse({ data: bufferToParse });
    try {
      const parsed = await parser.getText();
      return sendResumeResponse(res, 200, 'Resume parsed successfully', {
        text: parsed.text ?? '',
      });
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
    return sendResumeResponse(
      res,
      500,
      'Failed to process resume',
      null
    );
  }
};

module.exports = analyzeResume;