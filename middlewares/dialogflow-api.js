const request = require('request')
const dotenv = require('dotenv').config()
const baseUri = 'https://api.dialogflow.com/v1/contexts'

module.exports = {
	createNewContext: createNewContext
}

function createNewContext(context_data, original_request) {
	// console.log(context_data)
	return new Promise((resolve, reject) => {
		try {
			var new_context_data = JSON.parse(context_data)
			var options = { 
				method: 'POST',
				url: 'https://api.dialogflow.com/v1/contexts',
				qs: { 
					sessionId: original_request.sessionId 
				},
				headers: {
				 'Cache-Control': 'no-cache',
				 'Content-Type': 'application/json',
				 Authorization: 'Bearer ' + process.env.apiaitoken
				},
				body:[ 
					{ 
						lifespan: new_context_data.result.length,
				   		name: 'node_server_test',
				   		parameters: {
				   			pending_approvals: new_context_data,
				   			current_approval: new_context_data.result[0].sysapproval.display_value,
				   			current_position: 0
				   		}
				   	} 
				],
				json: true 
			}

			// console.log(JSON.stringify(options))

			request(options, (error, response, body) => {
	            if (!error && body.status.code == 200) {
	                console.log(Date() + ': '+ 'createNewContext request success! \n ')
	                resolve(body)
	            } else {
	                console.log(Date() + ': '+ 'createNewContext request error! \n ' + response)
	                // console.log(response)
	                reject(response)
	            }
	        })
	    } catch (error) {
	    	console.log(Date() + ': '+ 'createNewContext build error! ' + error)
            reject(JSON.stringify(error))
	    }
	})
}

function modifyCurrentContext(original_request) {
	// console.log(original_request.sessionId)
	return new Promise((resolve, reject) => {
		try {
			var new_context_data = request_body.result.contexts.find(context => context.name === 'node_server_test')
			var new_array_position = new_context_data.current_position + 1
			var options = { 
				method: 'POST',
				url: 'https://api.dialogflow.com/v1/contexts',
				qs: { 
					sessionId: original_request.sessionId 
				},
				headers: {
				 'Cache-Control': 'no-cache',
				 'Content-Type': 'application/json',
				 Authorization: 'Bearer ' + process.env.apiaitoken
				},
				body:[ 
					{ 
						lifespan: new_context_data.result.length - 1,
				   		name: 'node_server_test',
				   		parameters: {
				   			pending_approvals: new_context_data,
				   			current_approval: new_context_data.result[new_array_position].sys_id,
				   			current_position: new_array_position
				   		}
				   	} 
				],
				json: true 
			}

			request(options, (error, response, body) => {
	            if (!error && body.status.code == 200) {
	                console.log(Date() + ': '+ 'modifyCurrentContext request success! \n ')
	                resolve(body)
	            } else {
	                console.log(Date() + ': '+ 'modifyCurrentContext request error! \n ' + response)
	                // console.log(response)
	                reject(response)
	            }
	        })
	    } catch (error) {
	    	console.log(Date() + ': '+ 'modifyCurrentContext build error! ' + error)
            reject(error)
	    }
	})
}