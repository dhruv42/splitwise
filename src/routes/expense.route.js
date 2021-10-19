const router = require('express').Router();

const Expense = require('../controllers/expense.controller');
const validate = require('../middleware/validate');

/** 
* @route      POST /api/expense/add
*/
router.post('/add', validate('addExpense') ,Expense.add);

/** 
* @route      GET /api/expense/user/:userId
*/
router.get('/user/:userId', Expense.getUserExpense);

module.exports = router;