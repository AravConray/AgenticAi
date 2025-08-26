"use strict";

const express = require('express');
const asyncHandler = require('express-async-handler');

// Import search service methods
const { searchAnime, searchManga, searchCharacter } = require('../services/search_service');

const router = express.Router();

/**
 * GET /search?q={query}&type={type}
 * Example: /search?q=naruto&type=anime
 */
router.get('/search', asyncHandler(async (req, res) => {
  const query = req.query.q;
  const type = req.query.type;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  if (!type || !['anime', 'manga', 'character'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing "type" parameter. Valid values: anime, manga, character' });
  }

  let results;
  try {
    switch (type) {
      case 'anime':
        results = await searchAnime(query);
        break;
      case 'manga':
        results = await searchManga(query);
        break;
      case 'character':
        results = await searchCharacter(query);
        break;
    }
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Search service failed' });
  }

  return res.json({ query, type, results });
}));

module.exports = router;