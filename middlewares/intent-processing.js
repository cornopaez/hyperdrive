const search = require('./sn-api.js').search
const getUserDetails = require('./sn-api.js').getUserDetails
const getIncidentDetails = require('./sn-api.js').getIncidentDetails
const closeIncident = require('./sn-api.js').closeIncident

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
				getUserDetails('mark.ludwig@pnc.com') //Needs to change when we know where the information is coming from
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