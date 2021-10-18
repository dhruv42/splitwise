const Group = require('../models/group.model');
const Expense = require('../models/expense.model');
const { messages, statusCode } = require('../constants');

const add = async (req, res) => {
    try {
        const createdGroup = await Group.create(req.body);
        const expenseObject = {
            groupId:createdGroup.id,
            userDetails:{},
            singleUser:false
        }
        for(const u of req.body.users) {
            expenseObject.userDetails[u] = {
                expense:0
            };
        }
        
        await Expense.create(expenseObject);
        return res.status(statusCode.OK).json({ message: 'group added successfully' });
    } catch (error) {
        throw new Error(error.message);
    }
}

const addUserToTheGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        //check for user in both the collection
        const [group, expenseObject] = await Promise.all([
            Group.findById(groupId),
            Expense.findOne({groupId})
        ])

        if (!group || !expenseObject) {
            throw new Error('Group not found');
        }

        // add new user in both the collection
        group.users.push(req.body.userId);
        Expense.userDetails[userId] = {
            expense:0
        };

        // update both
        await Promise.all([
            Group.findOneAndUpdate({ _id: groupId }, group),
            Expense.findOneAndUpdate({groupId}, Expense)
        ]);

        return res.status(statusCode.OK).json({ message: 'user added to the group succussfully' });
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    add, addUserToTheGroup
}