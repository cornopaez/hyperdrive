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
		}
	})
}