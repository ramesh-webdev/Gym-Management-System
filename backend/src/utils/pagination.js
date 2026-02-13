/**
 * Parse page and limit from request query.
 * @param {object} query - req.query
 * @param {{ defaultLimit?: number, maxLimit?: number }} opts
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePagination(query, opts = {}) {
  const defaultLimit = opts.defaultLimit ?? 20;
  const maxLimit = opts.maxLimit ?? 100;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build paginated JSON response.
 * @param {object} res - Express res
 * @param {array} data - Page of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Page size
 */
function sendPaginated(res, data, total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  res.json({
    data,
    total,
    page,
    limit,
    totalPages,
  });
}

module.exports = { parsePagination, sendPaginated };
