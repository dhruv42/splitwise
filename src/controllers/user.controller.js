const User = require('../models/user.model');
const { messages, statusCode } = require('../constants');

const add = async (req, res) => {
    try {
        await User.create(req.body);
        return res.status(statusCode.CREATED).json({ message: 'user added succussfully' });
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    add
}