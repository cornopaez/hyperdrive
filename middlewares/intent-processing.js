const {
    search,
    getUserDetails,
    getIncidentDetails,
    closeIncident,
    createIncident,
    getRequestedApprovalsForUser,
    processReviewForRequest,
    queryProductCatalog,
    createRequest,
    getRequestDetails,
    baseurl } = require('./sn-api.js')

const {
    createKnowledgeBaseResponse,
    createRequestConfirmationResponse,
    createRequestCreationResponse,
    createWelcomeResponse,
    createPendingApprovalsResponse,
    createNextApprovalResponse } = require('./response-creation.js')

const {
    modifyCurrentContext } = require('./dialogflow-api.js')

const incidentUri = '/incident.do?sys_id=' //this is different from the incident uri in the sn-api library this one is for generating the links to actual incidents

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

module.exports = {
    processIntent: processIntent
}

function processIntent(request_body) {

    // console.log('This sessionId is ' + request_body.sessionId)

    var skype_uid = ''
    var case_number = ''
    var close_notes = ''
    var new_state = '' // This needs to be populated and passed to function with info from api.ai
    var request_sys_id = '' // This needs to be populated and passed to function with info from api.ai
    var item_name = ''
    var request_number = ''
    var item_count = ''

    return new Promise((resolve, reject) => {

        switch (request_body.result.action) {

        case 'input.welcome':
            skype_uid = request_body.originalRequest.data.address.user.id

            getUserDetails(skype_uid)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (input.welcome) - Success fetching user data.')
                    return createWelcomeResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (input.welcome) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (input.welcome) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })
            break

        case 'search_kb':
            search(request_body.result.resolvedQuery)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (search_kb) - Success fetching data from knowledge base.')
                    return createKnowledgeBaseResponse(success)
                })
                .then(response => {
                    console.log(Date() + ' : ProcessIntent (search_kb) - Success building response for api.ai.')
                    resolve(response)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (search_kb) - Something\'s gone wrong. \n' + JSON.stringify(error))
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

            getUserDetails(request_body.originalRequest.data.address.user.id)
                .then(success => {
                    console.log(JSON.stringify(success))
                    return createIncident(state, description, success.result[0].name)
                })
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

            getRequestedApprovalsForUser(skype_uid, request_body)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (pending_approvals) - Success fetching pending approvals.')
                    return createPendingApprovalsResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (pending_approvals) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (pending_approvals) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })
            break

        case 'initial_load':
            redis.get(request_body.sessionId)
                .then(success =>{
                    var current_context = JSON.parse(success)
                    request_number = current_context.current_approval_number
                    return getRequestDetails(request_number)
                })
                .then(success => {
                    return createNextApprovalResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (initial_load) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (initial_load) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })

            break

        case 'process_request_approve':
            redis.get(request_body.sessionId)
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Starting the rejection process.')
                    var current_context = JSON.parse(success)
                    request_sys_id = current_context.current_approval_table_sys_id
                    skype_uid = request_body.originalRequest.data.address.user.id
                    new_state = 'Approved'

                    return processReviewForRequest(request_body, request_sys_id, skype_uid, new_state)
                })
                .then(success => {
                    console.log(Date() + ':ProcessIntent (process_request_approve) -  Rejection process complete.' + success)
                    return redis.get(request_body.sessionId)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Getting case details.')
                    var current_context = JSON.parse(success)
                    // console.log(typeof current_context)
                    request_number = current_context.current_approval_number
                    // console.log(request_number)
                    return getRequestDetails(request_number)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Creating response.')
                    return createNextApprovalResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (process_request_approve) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })

            break

        case 'process_request_reject':

            redis.get(request_body.sessionId)
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Starting the approval process.')
                    var current_context = JSON.parse(success)
                    request_sys_id = current_context.current_approval_table_sys_id
                    skype_uid = request_body.originalRequest.data.address.user.id
                    new_state = 'Rejected'

                    return processReviewForRequest(request_body, request_sys_id, skype_uid, new_state)
                })
                .then(success => {
                    console.log(Date() + ':ProcessIntent (process_request_approve) -  Approval process complete.' + success)
                    return redis.get(request_body.sessionId)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Getting case details.')
                    var current_context = JSON.parse(success)
                    // console.log(typeof current_context)
                    request_number = current_context.current_approval_number
                    // console.log(request_number)
                    return getRequestDetails(request_number)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Creating response.')
                    return createNextApprovalResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (process_request_approve) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })

            break

        case 'process_request_skip':

            redis.get(request_body.sessionId)
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Starting the skip process.')
                    return modifyCurrentContext(success, request_body)
                })
                .then(success => {
                    console.log(Date() + ':ProcessIntent (process_request_approve) -  Skip process complete.' + success)
                    return redis.get(request_body.sessionId)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Getting case details.')
                    var current_context = JSON.parse(success)
                    // console.log(typeof current_context)
                    request_number = current_context.current_approval_number
                    // console.log(request_number)
                    return getRequestDetails(request_number)
                })
                .then(success => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Creating response.')
                    return createNextApprovalResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (process_request_approve) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error => {
                    console.log(Date() + ': ProcessIntent (process_request_approve) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    reject(error)
                })

            break

        case 'check_catalog':
            // item_name // This needs to be populated and passed to function with info from api.ai
            // console.log(request_body)
            item_name = request_body.result.parameters.MALSoftware ? request_body.result.parameters.MALSoftware : request_body.result.parameters.Hardware
            item_count = request_body.result.parameters.number ? request_body.result.parameters.number : '1'

            queryProductCatalog(item_name)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (check_catalog) - Success fetching data from Product Catalog.')
                    // console.log(success)
                    return createRequestConfirmationResponse(success, item_count)
                })
                .then(response => {
                    console.log(Date() + ' : ProcessIntent (check_catalog) - Success building response for api.ai.')
                    resolve(response)
                })
                .catch(error =>{
                    console.log(Date() + ': ProcessIntent (check_catalog) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    resolve(error)
                })

            break

        case 'create_request':
            // item_name // This needs to be populated and passed to function with info from api.ai
            skype_uid = request_body.originalRequest.data.address.user.id
            item_name = request_body.result.parameters.MALSoftware ? request_body.result.parameters.MALSoftware : request_body.result.parameters.Hardware
            item_count = request_body.result.parameters.number ? request_body.result.parameters.number : '1'

            // console.log(JSON.stringify(request_body))

            createRequest(item_name, item_count, skype_uid)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (create_request) - Success creating a request.')
                    return createRequestCreationResponse(success)
                })
                .then(message => {
                    console.log(Date() + ' : ProcessIntent (create_request) - Success building response for api.ai.')
                    resolve(message)
                })
                .catch(error =>{
                    console.log(Date() + ': ProcessIntent (create_request) - Something\'s gone wrong. \n' + JSON.stringify(error))
                    resolve(error)
                })
            break

        case 'noaction':
            console.log(Date() + ': ' + 'No action to perform.')
            var closedText
            var closedReturnString = {
                'speech': closedText,
                'displayText': closedText
            }
            resolve(JSON.stringify(closedReturnString))
            break

        case 'meme':
            console.log(Date() + ': ' + 'No action to perform.')
            var memeText = '<a href="https://i.pinimg.com/originals/53/bb/3f/53bb3f41d1fb17aa28b506c6b03980bd.jpg">IT Crowd</a>'
            var memeTextReturn = {
                'speech': memeText,
                'displayText': memeText
            }
            resolve(JSON.stringify(memeTextReturn))
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
