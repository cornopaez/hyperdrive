const {search, getUserDetails, createIncident, getIncidentDetails, closeIncident, kburi, baseurl } = require('./sn-api')
const users = {
    '29:1xafAd1PSIH3RuvwVq2wqqj4ve53EVEBBe4qP7AXYYeo': 'Womp Rats User'
}

module.exports.processIntent = processIntent

function processIntent(request_body) {

    return new Promise((resolve, reject) => {

        switch (request_body.result.action) {

        case 'input.welcome':
            console.log('processing default welcome intent')
            resolve(
                JSON.stringify({
                    'speech': `Hello, ${users[request_body.originalRequest.data.address.user.id]}. I am your PNC Assistant. How may I help you?`,
                    'displayText': `Hello, ${users[request_body.originalRequest.data.address.user.id]}. I am your PNC Assistant. How may I help you?`
                })
            )
            break

        case 'search_kb':
            search(request_body.result.resolvedQuery) //Needs to change when we know where the information is coming from
                .then(success => {
                    console.log('search_kb success!' + '\n' + success)
                    var result = {
                        'speech': 'KB Article',
                        'displayText': 'KB Article',
                        'messages': [
                            {
                                'buttons': [
                                    {
                                        'postback': baseurl + kburi + success.result.sys_id,
                                        'text': JSON.stringify(success.result.short_description)
                                    }
                                ],
                                'platform': 'skype',
                                'subtitle': 'KB Article',
                                'title': 'KB Article',
                                'type': 1
                            }
                        ]
                    }

                    console.log(`Results: ${JSON.stringify(result)}`)
                    resolve(JSON.stringify(result))
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
            createIncident('open', 'this is a test', 'Pierre Salera')
                .then(success => {
                    console.log('create incident success!')
                    resolve(success)
                })
                .catch(error => {
                    console.log('create incident error!')
                    reject(error)
                })
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
                    message: 'Error: Unknown Intent Action.'
                }
            }
            reject(response)
            break
        }
    })
}