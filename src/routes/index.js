const router = require('express').Router();

// const User = require('../controllers/user.controller');
// const Group = require('../controllers/group.controller');
// const Expense = require('../controllers/expense.controller');

const user = require('./user.route');
const group = require('./group.route');
const expense = require('./expense.route');


router.use('/user', user);
router.use('/group', group);
router.use('/expense', expense);

module.exports = router;