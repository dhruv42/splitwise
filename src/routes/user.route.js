const router = require('express').Router();

const User = require('../controllers/user.controller');

/** 
* @route      POST /api/user/add
*/
router.post('/add', User.add);

module.exports = router;