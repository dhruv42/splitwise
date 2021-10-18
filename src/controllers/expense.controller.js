const Expense = require('../models/expense.model');
const Transaction = require('../models/transaction.model');
const Group = require('../models/group.model');
const { messages, statusCode } = require('../constants');

const add = async (req, res) => {
    try {
        const { groupId, payee, amount, splitEqually, payers, percentageSplit = [], singleUser } = req.body;
        let expense = {}, group;

        // single user transaction
        if (singleUser) {
            const payerId = payers.find((user) => user !== payee);

            let payerAmount = (amount/2);
            if(percentageSplit.length) {
                payerAmount = (amount*percentageSplit[1])/100;
            }

            expense = await Expense.findOne({
                singleUser: true,
                [payee]: {
                    "$exists": true
                },
                [payerId]: {
                    "$exists": true
                },
            });

            if (!expense) {
                expense = await Expense.create({
                    groupId: null,
                    singleUser,
                    userDetails: {
                        [payee]: {
                            [payerId]: payerAmount,
                            expense: amount
                        },
                        [payerId]: {
                            [payee]: -1 * (payerAmount),
                            expense: 0
                        }
                    }
                })
            } else {

                if (!(payerId in expense.userDetails[payee])) {
                    expense.userDetails[payee][payerId] = 0;
                }
                expense.userDetails[payee][payerId] += payerAmount;
                expense.userDetails[payee].expense += amount;

                if (!(payee in expense.userDetails[payerId])) {
                    expense.userDetails[payerId] = 0;
                }
                expense.userDetails[payerId][payee] -= payerAmount;
                expense.userDetails[payerId].expense += 0;

                await Expense.updateOne({ id: expense.id }, {userDetails:expense.userDetails});

            }
            Transaction.create({
                groupId: null,
                splitEqually,
                percentageSplit,
                singleUser,
                amount,
                payee,
                payers
            })
            return res.status(statusCode.CREATED).json({ message: 'Expense added!' });
        }

        // group transaction
        [expense, group] = await Promise.all([
            Expense.findOne({ groupId }),
            Group.findById(groupId)
        ])

        if (!expense || !group) {
            throw new Error('Group does not exist');
        }

        // check if user exists in the group
        checkIfUsersExistInTheGroup(payers, group.users)


        const { userDetails } = expense;
        for (const u of payers) {
            if (!(u in userDetails)) {
                userDetails[u] = {
                    expense: 0
                };
            }
            if (u === payee) { // add expense in payee's object only
                userDetails[u].expense = amount;
            }
        }

        calculateAmount(amount, payers, userDetails, splitEqually, percentageSplit, payee)

        await Expense.updateOne({ groupId }, expense);

        Transaction.create({
            groupId,
            splitEqually,
            percentageSplit,
            singleUser,
            amount,
            payee,
            payers
        })

        return res.status(statusCode.CREATED).json({ message: 'Expense added!' });

    } catch (error) {
        console.log(error);
        return res.status(statusCode.BAD_REQUEST).json({ message: error.message });
        throw new Error(error.message);
    }
}


/**
 * Calculate amount for individual
 * @param {number} amount - amount to be split
 * @param {array} users - users amongst which amount to be split
 * @param {object} group - group expense details
 * @param {boolean} splitEqually - whethere want to split the amount equally or not.
 * @param {array} percentageSplit - if want to split based on percentage.
 */
function calculateAmount(amount, payers, userDetails, splitEqually, percentageSplit, payee) {
    try {

        let individualAmount = [];
        if (splitEqually) {
            individualAmount = Array(payers.length).fill(amount / payers.length);
        } else if (percentageSplit.length) {
            individualAmount = percentageSplit.map((p) => (amount * p) / 100);
        }

        for (let i = 0; i < payers.length; i++) {

            const u = payers[i];

            if (u === payee) continue;

            if (!(u in userDetails[payee])) {
                userDetails[payee][u] = 0;
            }

            if (!(payee in userDetails[u])) {
                userDetails[u][payee] = 0;
            }

            userDetails[payee][u] += individualAmount[i];
            userDetails[u][payee] -= individualAmount[i];
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Verify if all the members exist in the group
 * @param {array} payers
 * @param {array} groupMembers
 */
function checkIfUsersExistInTheGroup(payers, groupMembers) {
    for (const p of payers) {
        if (!groupMembers.includes(p)) {
            throw new Error('User does not exists in the group');
        }
    }
}

module.exports = {
    add
}