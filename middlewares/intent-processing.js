const search = require('./sn-api.js').search
const getUserDetails = require('./sn-api.js').getUserDetails

module.exports = {
	processIntent: processIntent
}

function processIntent(request_body) {

	return new Promise((resolve, reject) => {

		switch (request_body.action) {

			case 'search_kb':
				search(request_body.resolvedQuery)
				.then(success => {
					resolve(success)
				})
				.catch(error => {
					reject(error)
				})
				break
			case 'search_user':
				getUserDetails('mark.ludwig@pnc.com')
				.then(success => {
					console.log('search_user success!')
					resolve(JSON.parse(success))
				})
				.catch(error => {
					console.log('search_user error!')
					reject(error)
				})
				break
			case 'create_incident':
				break
		}
	})
}