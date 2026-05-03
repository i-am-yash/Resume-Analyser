const express = require('express');
const multer = require('multer');
const analyzeResume = require('../controllers/resumeControllers');

const RESUME_FIELD = 'resume';

const router = express.Router();

const multerEnvelope = (res, httpStatus, message) =>
  res.status(httpStatus).json({
    status: String(httpStatus),
    message,
    data: null,
  });

const multerPdf = multer({
  dest: 'uploads/',
  limits: { fileSize: 15 * 1024 * 1024 },
});

const resumeUpload = (req, res, next) => {
  multerPdf.single(RESUME_FIELD)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return multerEnvelope(
          res,
          400,
          `Invalid form field "${err.field}". The file field must be named exactly "${RESUME_FIELD}".`
        );
      }
      const byCode = {
        LIMIT_FILE_SIZE: 'File exceeds the maximum upload size',
        LIMIT_PART_COUNT: 'Too many parts in multipart request',
      };
      return multerEnvelope(
        res,
        400,
        byCode[err.code] || err.message || 'Upload was rejected'
      );
    }
    return multerEnvelope(res, 500, 'Failed to upload file');
  });
};

router.post('/analyze-resume', resumeUpload, analyzeResume);

module.exports = router;
