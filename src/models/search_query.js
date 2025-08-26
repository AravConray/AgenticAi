class SearchQuery {
  /**
   * @param {Object} options
   * @param {string} [options.search]
   * @param {string} [options.author]
   * @param {Array<string>} [options.tags]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   */
  constructor ({ search = '', author = '', tags = [], limit = 20, offset = 0 } = {}) {
    if (typeof search !== 'string') throw new TypeError('search must be a string');
    if (typeof author !== 'string') throw new TypeError('author must be a string');
    if (!Array.isArray(tags)) throw new TypeError('tags must be an array');
    if (typeof limit !== 'number' || limit < 1) throw new TypeError('limit must be a positive number');
    if (typeof offset !== 'number' || offset < 0) throw new TypeError('offset must be a non-negative number');
    this.search = search;
    this.author = author;
    this.tags = tags;
    this.limit = limit;
    this.offset = offset;
  }

  static fromRequest (req) {
    const query = req.query || {};
    const tags = query.tags
      ? Array.isArray(query.tags)
        ? query.tags
        : [query.tags]
      : [];
    return new SearchQuery({
      search: query.search || '',
      author: query.author || '',
      tags,
      limit: Number(query.limit) || 20,
      offset: Number(query.offset) || 0
    });
  }

  toMongoFilter () {
    const filter = {};
    if (this.search) filter.$text = { $search: this.search };
    if (this.author) filter.author = this.author;
    if (this.tags.length) filter.tags = { $in: this.tags };
    return filter;
  }

  toOptions () {
    return {
      limit: this.limit,
      skip: this.offset,
      sort: { createdAt: -1 }
    };
  }
}

module.exports = SearchQuery;
