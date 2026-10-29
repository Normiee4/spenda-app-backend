const ExpenseHistoryModel = require('./model');

async function list(userId, filters) {
  return ExpenseHistoryModel.findAllByUser(userId, filters);
}

module.exports = { list };
