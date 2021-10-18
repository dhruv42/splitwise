const router = require('express').Router();

const Group = require('../controllers/group.controller');

/** 
* @route      POST /api/group/add
*/
router.post('/add', Group.add);

router.post('/user/add/:groupId', Group.addUserToTheGroup);


module.exports = router;