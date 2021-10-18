const router = require('express').Router();

const Expense = require('../controllers/expense.controller');

/** 
* @route      POST /api/expense/add
*/
router.post('/add', Expense.add);

module.exports = router;