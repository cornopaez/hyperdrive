const {
    search,
    getUserDetails,
    getIncidentDetails,
    closeIncident,
    getRequestedApprovalsForUser,
    processReviewForRequest,
    queryProductCatalog,
    createRequest } = require('./sn-api.js')

const {
    createKnowledgeBaseResponse,
    createRequestConfirmationResponse,
    createRequestCreationResponse } = require('./response-creation.js')

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
            // console.log(request_body)
            item_name = request_body.result.parameters.MALSoftware ? request_body.result.parameters.MALSoftware : ''

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
            item_name = request_body.result.parameters.MALSoftware ? request_body.result.parameters.MALSoftware : ''

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