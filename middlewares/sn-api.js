const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const dotenv = require('dotenv').config() // eslint-disable-line no-unused-vars
// const baseurl = "https://gpietro3demo.service-now.com"
const baseurl = 'https://pncmelliniumfalcon.service-now.com'
const searchuri = '/api/now/table/kb_knowledge'
const userUri = '/api/now/table/sys_user'
const incidentUri = '/api/now/table/incident'
const requestUri = '/api/now/table/sc_request'
const sysapprovalUri = '/api/now/table/sysapproval_approver'
const catalogUri = '/api/now/table/pc_product_cat_item'
const kburi = '/nav_to.do?uri=%2Fkb_view.do%3Fsys_kb_id%3D'
const auth = 'Basic ' + btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

const {
    createNewContext,
    modifyCurrentContext } = require('./dialogflow-api.js')

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

// module.exports.search = search
// module.exports.getUserDetails = getUserDetails
module.exports = {
    search: search,
    getUserDetails: getUserDetails,
    getIncidentDetails: getIncidentDetails,
    closeIncident: closeIncident,
    createIncident: createIncident,
    baseurl: baseurl,
    kburi: kburi,
    getRequestedApprovalsForUser: getRequestedApprovalsForUser,
    processReviewForRequest: processReviewForRequest,
    queryProductCatalog: queryProductCatalog,
    createRequest: createRequest,
    // kburi: kburi,
    // baseurl: baseurl,
    getRequestDetails: getRequestDetails
}

/**
	This function searches the configured ServiceNow endpoint. It returns a Promise that resolves the data as plain text or provides
	the error occured.

	@param search_string - A single string of text to be searched for
	@return - Promise. Resolves to plain text from relevant articles returned.
*/
function search(search_string) {

    return new Promise((resolve, reject) =>{
        console.log(Date() + ': ' + 'Search String: ' + search_string)
        var search_query = '123TEXTQUERY321=' + search_string // Beginning of string necessary for query to work
        console.log(Date() + ': ' + 'Search Query: ' + search_query)
        var options = {
            method: 'GET',
            uri: baseurl + searchuri,
            qs: {
                sysparm_query: search_query,
                sysparm_limit: '1',
                sysparm_display_value: true,
                workflow_state: 'published'
            },
            json: true,
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: auth
            }
        }

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                reject(response)
            }
        })
    })
}

/**
	This function searches the configured ServiceNow endpoint for a specific user. It returns a Promise
	that resolves the data as a JSON object or provide the error occured.

	@param email_address - The email address of the user
	@return - Promise. Resolves to JSON object containing details of incident.
*/
function getUserDetails(skype_uid) {

    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            uri: baseurl + userUri,
            qs: {
                sysparm_query: 'u_skypeuid=' + skype_uid,
                sysparm_limit: '1' //This can be changed to suit our needs
            },
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: auth
            }
        };

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log(Date() + ': user detail request success!')
                resolve(JSON.parse(body))
            } else {
                console.log('user detail request error!')
                // console.log(response)
                reject(response)
            }
        })
    })
}

/**
	This function searches the configured ServiceNow endpoint for a specific incident. It returns a Promise
	that resolves the data as a JSON object or provide the error occured.

	@param incident_number - An incident number to be searched for
	@return - Promise. Resolves to JSON object containing details of incident.
*/
function getIncidentDetails(incident_number) {

    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: baseurl + incidentUri,
            qs: {
                sysparm_query: 'number=' + incident_number,
                sysparm_limit: '1'
            },
            headers: {
                'Cache-Control': 'no-cache',
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: auth
            }
        }

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                console.log('request error!')
                // console.log(response)
                reject(response)
            }
        })
    })
}

function createIncident(state, short_description, caller_id) {

    return new Promise((resolve, reject) => {
        switch (JSON.parse(state)) {
        case 'open':
            var openOptions = {
                method: 'POST',
                uri: baseurl + incidentUri,
                qs: {
                    sysparm_display_value: true
                },
                headers: {
                    'Cache-Control': 'no-cache',
                    Accept: 'application/json',
                    Authorization: auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        short_description: JSON.parse(short_description),
                        state: '1',
                        caller_id: caller_id,
                        urgency: '3'
                    }
                )
            }

            request(openOptions, (error, response, body) => {
                if (!error && response.statusCode == 201) {
                    console.log(Date() + ': ' + 'Incident creation success' + response.statusCode)
                    resolve(JSON.parse(body))
                } else {
                    console.log(Date() + ': ' + 'request error!' + error)
                    // console.log(response)
                    reject(response)
                }
            })
            break
        case 'closed':
            var closeOptions = {
                method: 'POST',
                uri: baseurl + incidentUri,
                qs: {
                    sysparm_display_value: true
                },
                headers: {
                    'Cache-Control': 'no-cache',
                    Authorization: auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        short_description: JSON.parse(short_description),
                        state: '6',
                        caller_id: caller_id,
                        close_notes: 'Resolved by PNC Assistant',
                        close_code: 'Closed/Resolved by Caller',
                        closed_at: Date(),
                        closed_by: caller_id,
                        urgency: '3'
                    }
                )
            }

            request(closeOptions, (error, response, body) => {
                if (!error && response.statusCode == 201) {
                    console.log(Date() + ': ' + 'Incident creation success')
                    resolve(JSON.parse(body))
                } else {
                    console.log(Date() + ': ' + 'request error! \n' + error)
                    reject(response)
                }
            })
            break
        default:
            break
        }
    })
}

/**
	This function closes an incident in the configured ServiceNow endpoint. It returns a Promise
	that resolves the data returned by SN as a JSON object or provide the error occured.

	@param incident_number - An incident number to be closed
	@param close_notes - The resolution notes for the incident
	@param close_code - Reolution Code is mandatory by SN
	@param user_id - The sys_id for the user closing the case. The default for this demo will be the bot's sys_id
	@return - Promise. Resolves to JSON object response from SN.
*/
function closeIncident(incident_number, close_notes, close_code = 'Closed/Resolved by Caller', user_id = '9ee1b13dc6112271007f9d0efdb69cd0') {

    return new Promise((resolve, reject) => {
        getIncidentDetails(incident_number)
            .then(success => {
                var options = {
                    method: 'PATCH',
                    url: baseurl + incidentUri + '/' + success.result[0].sys_id,
                    headers: {
                        'Cache-Control': 'no-cache',
                        Authorization: auth,
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        close_notes: close_notes,
                        closed_by: user_id,
                        close_code: close_code,
                        closed_at: Date()
                    },
                    json: true
                }

                request(options, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        resolve(body) // This response is already JSON. Parsing it will give an error.
                    } else {
                        console.log('request error!')
                        reject(response)
                    }
                })
            })
            .catch(error => {
                // If incident number comes up empty, handle error
                var response = {
                    statusCode: 500,
                    body: {
                        message: 'Error: Could not close incident. Incident number is invalid. Please try again. - ' + error
                    }
                }
                reject(response)
            })
    })
}

/**
	This function returns all pending approvals for a user. It returns a Promise
	that resolves the data returned by SN as a JSON object or provide the error occured.

	@param email_address - The email address of the user. The default is someone who currently has approvals pending.
	@return - Promise. Resolves to JSON object response from SN.
*/
function getRequestedApprovalsForUser(skype_uid, original_request) {
    return new Promise((resolve, reject) => {
        getUserDetails(skype_uid)
            .then(success => {

                try {
                    var options = {
                        method: 'GET',
                        url: baseurl + sysapprovalUri,
                        qs: {
                            sysparm_query: 'approver.nameSTARTSWITH' + success.result[0].name + '^stateINrequested',
                            sysparm_limit: '5'
                        },
                        headers: {
                            'Cache-Control': 'no-cache',
                            Authorization: auth
                        }
                    }

                    request(options, (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            console.log(Date() + ': '+ 'getRequestedApprovalsForUser request success!')

                            createNewContext(body, original_request)
                                .then(success => {
                                    console.log(success)
                                    resolve(JSON.parse(body))
                                })
                                .catch(error => {
                                    reject(error)
                                })
                        } else {
                            console.log(Date() + ': '+ 'getRequestedApprovalsForUser request error!')
                            // console.log(response)
                            reject(response)
                        }
                    })

                } catch (error) {
                    console.log(Date() + ': '+ 'getRequestedApprovalsForUser request error!' + error)
                    reject(error)
                }

            })
            .catch(error => {
                var response = {
                    statusCode: 500,
                    body: {
                        message: 'Error: Could not find user. Try again. - ' + error
                    }
                }
                reject(response)
            })
    })
}

/**
	This function approves or rejects a pending requested review for a request. It returns a Promise
	that resolves the data returned by SN as a JSON object or provide the error occured.

	@param request_sys_id - The sys_id of the request being approved/rejected
	@param new_state - It specifies the new state of the request. I.E: Approved, Rejected, No Longer Needed
	@param email_address - The email for the user processing the review
	@return - Promise. Resolves to JSON object response from SN.
*/
function processReviewForRequest(original_request, request_sys_id, skype_uid, new_state = 'Approved') {
    return new Promise((resolve, reject) => {
        getUserDetails(skype_uid)
            .then(success => {
                try {
                    var comments = 'Request was processed via PNC Assistant on behalf of ' + success.result[0].name + ' (' + success.result[0].email + ')'
                    var options = {
                        method: 'PATCH',
                        url: baseurl + sysapprovalUri + '/' + request_sys_id,
                        headers: {
                            'Cache-Control': 'no-cache',
                            Authorization: auth,
                            'Content-Type': 'application/json' },
                        body: {
                            state: new_state,
                            comments: comments
                        },
                        json: true
                    }

                    // console.log(options)

                    request(options, (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            console.log(Date() + ': '+ 'processReviewForRequest request success!')

                            redis.get(original_request.sessionId)
                                .then(success => {
                                    // console.log(success)
                                    return modifyCurrentContext(success, original_request)
                                })
                                .then(success => {
                                    console.log('modifyCurrentContext success' + success)
                                    resolve(body)
                                })
                                .catch(error => {
                                    console.log('modifyCurrentContext error')
                                    reject(error)
                                })

                        } else {
                            console.log(Date() + ': '+ 'processReviewForRequest request error!')
                            // console.log(response)
                            reject(response)
                        }
                    })

                } catch (error) {
                    console.log(Date() + ': '+ 'processReviewForRequest request error! ' + error)
                    reject(error)
                }

            })
            .catch(error => {
                console.log(Date() + ': '+ 'processReviewForRequest error - getUserDetails failed. - ' + error)
                var response = {
                    statusCode: 500,
                    body: {
                        message: 'Error: Could not find user. Try again.'
                    }
                }
                reject(response)
            })
    })
}

/**
	This function checks for an item in the Product Catalog with a given name. It returns a Promise
	that resolves the data returned by SN as a JSON object or provide the error occured.

	@param item_name - The name of the item being sought
	@return - Promise. Resolves to JSON object response from SN.
*/
function queryProductCatalog(item_name) {
    return new Promise((resolve, reject) => {
        var query_string = item_name.split(' ').map(x => 'nameLIKE' + x.toLowerCase()).join('^')

        var options = {
            method: 'GET',
            url: baseurl + catalogUri,
            qs: {
                sysparm_query: query_string, // STARSWITH can be changed to LIKE for a broader search
                sysparm_limit: '1' // This can be changed to suite needs in the future
            },
            headers: {
                'Cache-Control': 'no-cache',
                Authorization: auth
            }
        }
        // console.log(options)
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log(Date() + ': '+ 'queryProductCatalog request success!')
                resolve(JSON.parse(body))
            } else {
                console.log(Date() + ': '+ 'queryProductCatalog request error!')
                // console.log(response)
                reject(response)
            }
        })
    })
}

/**
	This function creates a request for a given item. It first checks the catalog to get information
	about the item, then that information to create the request. It returns a Promise
	that resolves the data returned by SN as a JSON object or provide the error occured.

	@param item_name - The name of the item being sought
    @param item_count - The amount of item_name being requested by user
	@param skype_uid - The skype UID for the beneficiary of this request
	@param approval_requested - Optional. This defines whether the request triggers the approval workflow in SN
	@return - Promise. Resolves to JSON object response from SN.
*/
function createRequest(item_name, item_count, skype_uid, approval_requested = 'Requested') {
    return new Promise((resolve, reject) => {

        Promise.all([queryProductCatalog(item_name), getUserDetails(skype_uid)])
            .then(success => {
                var item_data = success[0].result[0]
                var user_data = success[1].result[0]
                var description = ''
                var short_description = ''

                try {
                    // Creationing the description based on the number of item_count
                    if (item_count <= 1) {
                        description = 'This request has been processed by PNC Assistant. ' + user_data.name + ' (' + user_data.email + ') is requesting ' + item_data.name
                        short_description = user_data.name + ' (' + user_data.email + ') is requesting ' + item_data.name
                    } else {
                        description = 'This request has been processed by PNC Assistant. ' + user_data.name + ' (' + user_data.email + ') is requesting ' + item_count + ' ' + item_data.name + 's'
                        short_description = user_data.name + ' (' + user_data.email + ') is requesting ' + item_count + ' ' + item_data.name + 's'
                    }

                    var options = {
                        method: 'POST',
                        url: baseurl + requestUri,
                        headers: {
                            'Cache-Control': 'no-cache',
                            Authorization: auth,
                            'Content-Type': 'application/json' },
                        body: {
                            approval: approval_requested,
                            upon_approval: 'proceed',
                            requested_for: user_data.sys_id,
                            price: item_data.price * item_count,
                            short_description: short_description, // Needs discussion
                            description: description
                        },
                        json: true
                    }

                    request(options, (error, response, body) => {
                        if (!error && response.statusCode == 201) {
                            console.log(Date() + ': '+ 'createRequest request success!')
                            resolve(body)
                        } else {
                            console.log(Date() + ': '+ 'createRequest request error!')
                            // console.log(response)
                            reject(response)
                        }
                    })
                } catch (error) {
                    console.log(Date() + ': '+ 'createRequest build error! ' + error)
                    reject(error)
                }
            })
            .catch(error => {
                console.log(Date() + ': Something\'s gone wrong with a promise in createRequest. See details for more info. ' + error)
                reject(error)
            })
    })
}

function getRequestDetails(request_sys_id) {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: baseurl + requestUri,
            qs: {
                sys_id: request_sys_id,
                sysparm_limit: '1',
                sysparm_display_value: true
            },
            headers: {
                'Cache-Control': 'no-cache',
                Accept: 'application/json',
                'Content-Type': 'application/json' ,
                Authorization: auth
            }
        }

        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                console.log('request error!')
                // console.log(response)
                reject(response)
            }
        })
    })
}
