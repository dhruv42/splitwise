const Joi = require('joi');
const { messages, statusCode } = require('../constants');

const allSchemas = {
    addUser: Joi.object().keys({
        userName: Joi.string().trim().required(),
        email: Joi.string().trim().required()
    }),

    addGroup: Joi.object().keys({
        users: Joi.array().items(Joi.string()).min(1),
        name: Joi.string().trim().required(),
        description: Joi.string().trim()
    }),

    addExpense: Joi.object().keys({
        amount: Joi.number().min(1).required(),
        payee: Joi.string().trim().required(),
        payers: Joi.array().items(Joi.string()).min(2),
        percentageSplit: Joi.array().items(Joi.number()),
        splitEqually: Joi.boolean().required(),
        groupId:Joi.string().allow(null)
    })
}

module.exports = function inputValidator(schemaName) {
    return function (req, res, next) {
        const validationResult = allSchemas[schemaName].validate(req.body);
        if (validationResult && validationResult.error) {
            return res.status(statusCode.VALIDATION).json({
                success: false,
                error: true,
                message: messages.VALIDATION_ERROR,
                details: validationResult.error.details[0].message.replace(/"/g, '')
            })
        }
        next();
    };
}