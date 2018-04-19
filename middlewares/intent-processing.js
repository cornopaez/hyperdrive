const {
    search,
    getUserDetails,
    getIncidentDetails,
    closeIncident,
    getRequestedApprovalsForUser,
    processReviewForRequest,
    queryProductCatalog,
    createRequest } = require('./sn-api')
const incidentUri = '/incident.do?sys_id=' //this is different from the incident uri in the sn-api library this one is for generating the links to actual incidents
const users = {
    '29:1xafAd1PSIH3RuvwVq2wqqj4ve53EVEBBe4qP7AXYYeo': 'Womp Rats User',
    '29:1k74gN7zOhungfGosSKFS0REaJRMuX_-juF_xRdTSodE': 'Womp Rats Manager'
}

module.exports = {
    processIntent: processIntent
}

function processIntent(request_body) {

    var skype_uid = ''
    var case_number = ''
    var close_notes = ''
    var new_state = '' // This needs to be populated and passed to function with info from api.ai
    var request_sys_id = '' // This needs to be populated and passed to function with info from api.ai
    var item_name = ''

    return new Promise((resolve, reject) => {

        switch (request_body.result.action) {

        case 'input.welcome':
            console.log(Date() + ': processing default welcome intent\n')
            resolve(
                JSON.stringify({
                    'speech': `Hello, ${users[request_body.originalRequest.data.address.user.id]}. I am your PNC Assistant. How may I help you?`,
                    'displayText': `Hello, ${users[request_body.originalRequest.data.address.user.id]}. I am your PNC Assistant. How may I help you?`
                })
            )
            break

        case 'search_kb':
            console.log('processing search_kb intent')
            search(request_body.result.resolvedQuery) //Needs to change when we know where the information is coming from
                .then(success => {
                    console.log(Date() + ': ' + 'search_kb success!' + '\n' + success)
                    try {
                        for (let searchResult of success.result) {
                            console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
                            console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
                            var result = {
                                'speech': 'KB Article',
                                'displayText': 'KB Article',
                                'messages': [
                                    {
                                        'buttons': [
                                            {
                                                'postback': baseurl + kburi + searchResult.sys_id,
                                                'text': searchResult.short_description
                                            }
                                        ],
                                        'platform': 'skype',
                                        'subtitle': searchResult.short_description,
                                        'title': 'KB Article',
                                        'type': 1
                                    },
                                    {
                                        'platform': 'skype',
                                        'replies': [
                                            'Yes',
                                            'No'
                                        ],
                                        'title': 'Did this resolve your issue?',
                                        'type': 2
                                    }
                                ]
                            }
                            resolve(result)
                        }
                    } catch (error) {
                        console.log(Date() + ': ' + 'Error generating reply message for api.ai in search_kb' + error)
                        reject(error)
                    }
                })
                .catch(error => {
                    console.log(Date() + ': ' + 'search_kb error: '+ error)
                    reject(error)
                })
            break

        case 'search_user':
            skype_uid = request_body.originalRequest.data.address.user.id
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
            //console.log(Date() + ': ' + 'Request Body: \n' +JSON.stringify(request_body))
            var state = JSON.stringify(request_body.result.parameters.state)
            var description = JSON.stringify(request_body.result.contexts[1].parameters.any)
            console.log(Date() + ': ' + 'Creating an Incident in state: ' + state)
            console.log(Date() + ': ' + 'Incident Short Description: ' + description)
            createIncident(state, description, 'Pierre Salera')
                .then(success => {
                    switch (JSON.parse(state)) {
                    case 'open':
                        var openText = `Ok. I will open an incident for you on this issue. Your incident number is: <a href="${baseurl + incidentUri + success.result.sys_id}">${success.result.number}</a>. A tech will reach out to you shortly.`
                        var openReturnString = {
                            'speech': openText,
                            'displayText': openText
                        }
                        resolve(JSON.stringify(openReturnString))
                        break;
                    case 'closed':
                        var closedText = `I am glad I was able to provide you with a solution. Should you need to reopen the incident, your incident # is: <a href="${baseurl + incidentUri + success.result.sys_id}">${success.result.number}</a>. Can I help you with anything else?`
                        var closedReturnString = {
                            'speech': closedText,
                            'displayText': closedText
                        }
                        resolve(JSON.stringify(closedReturnString))
                        break;
                    default:
                        console.log('blah')
                    }
                    console.log('create incident success!')
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
            case_number = request_body.result.parameters.case
            close_notes = request_body.result.parameters.notes

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
            skype_uid = request_body.originalRequest.data.address.user.id
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
            // new_state // This needs to be populated and passed to function with info from api.ai
            // request_sys_id // This needs to be populated and passed to function with info from api.ai
            skype_uid = request_body.originalRequest.data.address.user.id
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
            // item_name // This needs to be populated and passed to function with info from api.ai
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
            // item_name // This needs to be populated and passed to function with info from api.ai
            skype_uid = request_body.originalRequest.data.address.user.id

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
         
        case 'noaction':
            console.log(Date() + ': ' + 'No action to perform.')

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

