const User = require('../models/user.model');
const { messages, statusCode } = require('../constants');

const add = async (req, res) => {
    try {
        const user = await User.create(req.body);
        return res.status(statusCode.CREATED).json({ 
            message: 'user added succussfully',
            data:{
                id:user.id,
                userName:user.userName,
                email:user.email
            }
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    add
}