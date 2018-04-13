const { 
	search, 
	getUserDetails, 
	getIncidentDetails, 
	closeIncident, 
	getRequestedApprovalsForUser, 
	processReviewForRequest,
	queryProductCatalog,
	createRequest } = require('./sn-api.js')

module.exports = {
	processIntent: processIntent
}

function processIntent(request_body) {

	return new Promise((resolve, reject) => {

		switch (request_body.result.action) {

			case 'search_kb':
				search(request_body.result.action) //Needs to change when we know where the information is coming from
				.then(success => {
					console.log('search_kb success!')
					resolve(success)
				})
				.catch(error => {
					console.log('search_kb error!')
					reject(error)
				})
				break

			case 'search_user':
				var skype_uid = request_body.originalRequest.data.address.user.id
				getUserDetails(skype_uid) //Needs to change when we know where the information is coming from
				.then(success => {
					console.log('search_user success!')
					resolve(success)
				})
				.catch(error => {
					console.log('search_user error!')
					reject(error)
				})
				break

			case 'create_incident':
				break

			case 'search_incident':
				getIncidentDetails(request_body.resolvedQuery) //Needs to change when we know where the information is coming from
				.then(success => {
					console.log('search_incident success!')
					resolve(success)
				})
				.catch(error => {
					console.log('search_incident error!')
					reject(error)
				})
				break

			case 'close_incident':
				// Local vars
				// These are based on a sample call from API.AI
				var case_number = request_body.result.parameters.case
				var close_notes = request_body.result.parameters.notes

				closeIncident(case_number, close_notes)
				.then(success => {
					console.log('close_incident success!')
					resolve(success)
				})
				.catch(error => {
					console.log('close_incident error!')
					reject(error)
				})
				break

			case 'pending_approvals':
				var skype_uid = request_body.originalRequest.data.address.user.id
				getRequestedApprovalsForUser(skype_uid)
				.then(success => {
					console.log('pending_approvals success!')
					resolve(success)
				})
				.catch(error => {
					console.log('pending_approvals error!')
					reject(error)
				})
				break

			case 'process_request':
				var new_state // This needs to be populated and passed to function with info from api.ai
				var request_sys_id // This needs to be populated and passed to function with info from api.ai
				var skype_uid = request_body.originalRequest.data.address.user.id
				processReviewForRequest('10f9447adba52200a6a2b31be0b8f57c', skype_uid)
				.then(success => {
					console.log('process_request success!')
					resolve(success)
				})
				.catch(error =>{
					console.log('process_request error!')
					resolve(error)
				})

				break

			case 'check_catalog':
				var item_name // This needs to be populated and passed to function with info from api.ai
				queryProductCatalog('AdoBe')
				.then(success => {
					console.log('check_catalog success!')
					resolve(success)
				})
				.catch(error =>{
					console.log('check_catalog error!')
					resolve(error)
				})

				break

			case 'create_request':
				var item_name // This needs to be populated and passed to function with info from api.ai
				var skype_uid = request_body.originalRequest.data.address.user.id

				createRequest('AdoBe', skype_uid)
				.then(success => {
					console.log('create_request success!')
					resolve(success)
				})
				.catch(error =>{
					console.log('create_request error!')
					resolve(error)
				})
				break

			default:
				var response = {
					statusCode: 500,
					body: {
						message: 'Error: Unknown Intent Action'
					}
				}
				reject(response)
				break
		}
	})
}