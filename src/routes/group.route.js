const router = require('express').Router();

const Group = require('../controllers/group.controller');
const validate = require('../middleware/validate');

/** 
* @route      POST /api/group/add
*/
router.post('/add',validate('addGroup') ,Group.add);

/** 
* @route      POST /api/group/user/add/:groupId
*/
router.post('/user/add/:groupId', Group.addUserToTheGroup);


module.exports = router;