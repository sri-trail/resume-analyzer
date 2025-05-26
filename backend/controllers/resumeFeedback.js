// backend/routes/resumeFeedback.js
const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/aicontrollers');

router.post('/analyze', analyzeResume);

module.exports = router;
