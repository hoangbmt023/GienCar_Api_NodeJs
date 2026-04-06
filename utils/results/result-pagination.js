const createPagination = ({ page = 1, limit = 10, total = 0 }) => {
  const last = Math.ceil(total / limit);

  return {
    page,
    last,
    limit,
    total,
  };
};

module.exports = createPagination;
