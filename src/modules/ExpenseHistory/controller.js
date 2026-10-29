const asyncHandler = require('../../utils/asyncHandler');
const ExpenseHistoryService = require('./service');

const list = asyncHandler(async (req, res) => {
  const { items, ...meta } = await ExpenseHistoryService.list(req.user.id, req.query);
  res.status(200).json({ success: true, data: items, meta });
});

module.exports = { list };
