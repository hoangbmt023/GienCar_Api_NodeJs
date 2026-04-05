const MAX_SIZE = 100;

const buildPaging = (query) => {
  let page = parseInt(query.page) || 1;
  let size = parseInt(query.size) || 10;
  let sortBy = query.sortBy || null;
  let sortDir = query.sortDir || "desc";

  // giống Java: Math.max(page - 1, 0)
  const safePage = Math.max(page - 1, 0);

  // clamp size
  const safeSize = Math.min(Math.max(size, 1), MAX_SIZE);

  // normalize sortDir
  const safeSortDir =
    !sortDir || sortDir.trim() === "" ? "desc" : sortDir.toLowerCase();

  // build sort object cho mongoose
  let sort = {};
  if (sortBy) {
    sort[sortBy] = safeSortDir === "asc" ? 1 : -1;
  }

  return {
    page,
    size: safeSize,
    skip: safePage * safeSize,
    sort,
  };
};

module.exports = buildPaging;
