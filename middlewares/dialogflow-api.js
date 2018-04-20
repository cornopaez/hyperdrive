const request = require('request') // eslint-disable-line
const dotenv = require('dotenv').config() // eslint-disable-line
const baseUri = 'https://api.dialogflow.com/v1/contexts' // eslint-disable-line


const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = {
    createNewContext: createNewContext,
    modifyCurrentContext: modifyCurrentContext
}

function createNewContext(context_data, original_request) {
    // console.log(context_data)
    return new Promise((resolve, reject) => {
        try {
            var new_context_data = JSON.parse(context_data)
            var context = {
                pending_approvals: new_context_data,
                current_approval_number: new_context_data.result[0].sysapproval.value,
                current_approval_table_sys_id: new_context_data.result[0].sys_id,
                current_position: 0
            }

            redis.set(original_request.sessionId, JSON.stringify(context))
            resolve('All is well with redis')
        } catch(error) {
            reject('All is bad :\'(')
        }
    })
}

function modifyCurrentContext(context_data, original_request) {
    // console.log(original_request.sessionId)
    return new Promise((resolve, reject) => {
        try {
            redis.get(original_request.sessionId)
                .then(success => {
                    var new_context_data = JSON.parse(success)
                    var pending_approvals = new_context_data.pending_approvals
                    var new_array_position = new_context_data.current_position + 1
                    // console.log(new_context_data.current_position)
                    var context = {
                        pending_approvals: pending_approvals,
                        current_approval_number: pending_approvals.result[new_array_position].sysapproval.value,
                        current_approval_table_sys_id: pending_approvals.result[new_array_position].sys_id,
                        current_position: new_array_position
                    }
                    console.log(context)
                    redis.set(original_request.sessionId, JSON.stringify(context))
                    resolve('All is well with redis')
                })
                .catch(error => {
                    reject('All is very bad :\'(' + error)
                })
        } catch(error) {
            reject('All is bad :\'( ' + error)
        }
    })
}
