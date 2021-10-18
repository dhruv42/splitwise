const router = require('express').Router();

const User = require('../controllers/user.controller');
const validate = require('../middleware/validate');

/** 
* @route      POST /api/user/add
*/
router.post('/add', validate('addUser'),User.add);

module.exports = router;