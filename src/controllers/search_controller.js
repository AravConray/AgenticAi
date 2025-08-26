// src/controllers/search_controller.js

const searchService = require('../services/search_service');
const { validationResult, query } = require('express-validator');

// Validation middleware for search endpoint
const validateSearch = [
  query('q')
    .exists({ checkFalsy: true })
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .isLength({ max: 200 })
    .withMessage('Search query must not exceed 200 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Results per page must be between 1 and 100'),
];

// Controller action for searching
async function search(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const queryStr = req.query.q;
    const page = parseInt(req.query.page, 10) || 1;
    const perPage = parseInt(req.query.per_page, 10) || 10;

    const results = await searchService.search(queryStr, { page, perPage });

    res.json({
      query: queryStr,
      page,
      perPage,
      total: results.total,
      items: results.items,
    });
  } catch (err) {
    // Log error for debugging
    console.error('Search error:', err);
    next(err);
  }
}

module.exports = { validateSearch, search };
