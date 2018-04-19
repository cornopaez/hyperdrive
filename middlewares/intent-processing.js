const {
    search,
    getUserDetails,
    getIncidentDetails,
    closeIncident,
    getRequestedApprovalsForUser,
    processReviewForRequest,
    queryProductCatalog,
    createRequest,
    getRequestDetails } = require('./sn-api.js')

const {
    createKnowledgeBaseResponse,
    createRequestConfirmationResponse,
    createRequestCreationResponse,
    createWelcomeResponse,
    createPendingApprovalsResponse,
    createNextApprovalResponse } = require('./response-creation.js')

module.exports = {
    processIntent: processIntent
}

function processIntent(request_body) {

    console.log('This sessionId is ' + request_body.sessionId)

    var skype_uid = ''
    var case_number = ''
    var close_notes = ''
    var new_state = '' // This needs to be populated and passed to function with info from api.ai
    var request_sys_id = '' // This needs to be populated and passed to function with info from api.ai
    var item_name = ''
    var request_contexts
    var request_sys_id = ''

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

            request_sys_id = request_body.result.contexts.find(context => context.name === 'node_server_test').parameters.current_approval
            console.log(request_sys_id)
            getRequestDetails(request_sys_id)
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
            // new_state // This needs to be populated and passed to function with info from api.ai
            // request_sys_id // This needs to be populated and passed to function with info from api.ai
            current_approval = request_body.result.contexts.find(context => context.name === 'node_server_test').parameters.current_approval
            skype_uid = request_body.originalRequest.data.address.user.id
            new_state = 'Approved'
            // resolve(request_context)
            
            processReviewForRequest(request_body, current_approval, skype_uid, new_state)
                .then(success => {
                    console.log('process_request success!')
                    resolve(success)
                })
                .catch(error =>{
                    console.log('process_request error!')
                    resolve(error)
                })

            break

        case 'process_request_reject':
            break

        case 'process_request_skip':
            break

        case 'check_catalog':
            // item_name // This needs to be populated and passed to function with info from api.ai
            // console.log(request_body)
            item_name = request_body.result.parameters.MALSoftware ? request_body.result.parameters.MALSoftware : request_body.result.parameters.Hardware

            queryProductCatalog(item_name)
                .then(success => {
                    console.log(Date() + ' : ProcessIntent (check_catalog) - Success fetching data from Product Catalog.')
                    // console.log(success)
                    return createRequestConfirmationResponse(success)
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

            // console.log(JSON.stringify(request_body))

            createRequest(item_name, skype_uid)
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