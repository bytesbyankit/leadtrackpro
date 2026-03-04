const { body, validationResult } = require('express-validator');

// Predefined dropdown values from PRD
const CALL_STATUS = ['Not Called', 'Called', 'No Answer'];
const LEAD_STATUS = ['Interested', 'Follow Up', 'Not Interested'];
const INTEREST_LEVEL = ['High', 'Medium', 'Low'];
const DEAL_STAGE = [
  'Lead Found',
  'Contacted',
  'Interested',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const leadValidationRules = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business Name is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone Number is required')
    .matches(/^[\d\s\+\-\(\)]{7,20}$/)
    .withMessage('Phone must be 7–20 digits/valid characters'),

  body('callStatus')
    .trim()
    .notEmpty()
    .withMessage('Call Status is required')
    .isIn(CALL_STATUS)
    .withMessage(`Call Status must be one of: ${CALL_STATUS.join(', ')}`),

  body('leadStatus')
    .trim()
    .notEmpty()
    .withMessage('Lead Status is required')
    .isIn(LEAD_STATUS)
    .withMessage(`Lead Status must be one of: ${LEAD_STATUS.join(', ')}`),

  body('interestLevel')
    .optional({ values: 'falsy' })
    .isIn(INTEREST_LEVEL)
    .withMessage(`Interest Level must be one of: ${INTEREST_LEVEL.join(', ')}`),

  body('dealStage')
    .optional({ values: 'falsy' })
    .isIn(DEAL_STAGE)
    .withMessage(`Deal Stage must be one of: ${DEAL_STAGE.join(', ')}`),

  body('followUp')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Follow-up must be a valid date (YYYY-MM-DD)'),

  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Email must be valid'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = {
  leadValidationRules,
  handleValidationErrors,
  CALL_STATUS,
  LEAD_STATUS,
  INTEREST_LEVEL,
  DEAL_STAGE,
};
