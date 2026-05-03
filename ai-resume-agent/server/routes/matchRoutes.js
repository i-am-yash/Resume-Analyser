const express = require('express');
const multer = require('multer');
const matchResumeToJob = require('../controllers/matchControllers');

const router = express.Router();

const multipartNone = multer({
  limits: { fieldSize: 5 * 1024 * 1024 }, // long job descriptions per field
}).none();

// Multipart/form-data only — skip for JSON/urlencoded so those bodies work as before
function parseMultipartFieldsIfNeeded(req, res, next) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('multipart/form-data')) {
    return multipartNone(req, res, next);
  }
  next();
}

router.post('/match-job', parseMultipartFieldsIfNeeded, matchResumeToJob);

module.exports = router;
