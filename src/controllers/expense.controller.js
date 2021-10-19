const Expense = require('../models/expense.model');
const Transaction = require('../models/transaction.model');
const Group = require('../models/group.model');
const User = require('../models/user.model');
const { messages, statusCode } = require('../constants');

const add = async (req, res) => {
    try {
        const { groupId, payee, amount, splitEqually, payers, percentageSplit = [] } = req.body;
        let { singleUser } = req.query;
        singleUser = (singleUser && singleUser === "true" ? true : false);
        let expense = {}, group;

        // single user transaction
        if (singleUser) {
            let payerIndex, payerId;
            for(let i=0; i<payers.length; i++) {
                if(payers[i]!==payee) {
                    payerIndex = i;
                    payerId = payers[i];
                    break;
                }
            }
            
            let payerAmount = (amount / 2);
            if (percentageSplit.length) {
                let payerPercentage = percentageSplit[payerIndex];
                payerAmount = (amount * payerPercentage) / 100;
            }

            expense = await Expense.findOne({
                singleUser: true,
                [`userDetails.${payee}`]: {
                    "$exists": true
                },
                [`userDetails.${payerId}`]: {
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

                await Expense.updateOne({ id: expense.id }, { userDetails: expense.userDetails });

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

        if (!groupId) {
            throw new Error('groupId is required');
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
    }
}


const getUserExpense = async (req, res) => {
    try {
        const response = [];
        const { userId } = req.params;
        const { skip = 0, limit = 10 } = req.query;
        if (!userId) {
            return res.status(statusCode.OK).json({ data: response });
        }

        const expense = await fetchUserExpenses(userId, skip, limit);

        for (const e of expense) {
            const obj = {
                expenseId:e.id,
                totalExpense: e.userDetails[userId]["expense"],
                transactions: [],
                singleUser: e.singleUser
            }

            let users = [];
            for (const t in e.userDetails[userId]) {
                if (t === "expense") continue;
                users.push(t);
            }

            users = await User.find({ _id: { "$in": users } }, { userName: 1 });


            for (const t in e.userDetails[userId]) {
                if (t === "expense") continue;
                const userName = users.find((u) => u._doc._id == t);
                if (e.userDetails[userId][t] < 0) {
                    obj.transactions.push({
                        amount: e.userDetails[userId][t],
                        message: `You owe ${Math.abs(e.userDetails[userId][t])} to ${userName._doc.userName}`
                    })
                } else if (e.userDetails[userId][t] > 0) {
                    obj.transactions.push({
                        amount: e.userDetails[userId][t],
                        message: `You get back ${e.userDetails[userId][t]} from ${userName._doc.userName}`
                    })
                }
            }
            response.push(obj);
        }

        return res.status(statusCode.OK).json({ data: response });

    } catch (error) {
        console.log(error);
        return res.status(statusCode.BAD_REQUEST).json({ message: error.message });
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

async function fetchUserExpenses(userId, skip, limit) {
    return  new Promise((resolve,reject) => {
        Expense.find({
            [`userDetails.${userId}`]:{
                "$exists": true
            }
        },{},{ skip:Number(skip), limit:Number(limit) },(err,docs) => {
            if(err) {
                reject(err);
            } else {
                resolve(docs);
            }
        }).sort({createdAt:-1})
    })
}

module.exports = {
    add, getUserExpense
}