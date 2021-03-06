const {baseurl, kburi} = require('./sn-api.js')
const reqQueryUri = '/nav_to.do?uri=%2Fsc_request.do%3Fsys_id%3D'


module.exports = {
    createKnowledgeBaseResponse: createKnowledgeBaseResponse,
    createRequestConfirmationResponse: createRequestConfirmationResponse,
    createRequestCreationResponse: createRequestCreationResponse,
    createWelcomeResponse: createWelcomeResponse,
    createPendingApprovalsResponse: createPendingApprovalsResponse,
    createNextApprovalResponse: createNextApprovalResponse
}

function createWelcomeResponse(user_data) {
    return new Promise((resolve, reject) => {
        try {
            // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
            // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
            var result = {
                'speech': 'Reqeuest Confirmation',
                'displayText': 'Reqeuest Confirmation',
                'messages': [
                    {
                        'platform': 'skype',
                        'speech': `Hi (wave), ${user_data.result[0].name}. I am your PNC Assistant. I can find technology solutions, open requests, and manage approvals. Type 'help' for examples. How may I assist you?`,
                        'type': 0
                    }
                ]
            }

            resolve(result)
        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createWelcomeResponse' + error)
            reject(error)
        }
    })
}

/**
    This function creates a response that can be consumed by api.ai (Dialogflow)
    @param kb_data - This should be the raw data (in JSON format) that comes back from ServiceNow
    @retun - Promise. Resolves to a response or the raw error data
*/
function createKnowledgeBaseResponse(kb_data) {

    return new Promise((resolve, reject) => {
        try {
            for (let searchResult of kb_data.result) {
                // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
                // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
                var result = {
                    'speech': 'Knowledge Base Article',
                    'displayText': 'Knowledge Base Article',
                    'messages': [
                        {
                            'buttons': [
                                {
                                    'postback': baseurl + kburi + searchResult.sys_id,
                                    'text': 'Click here to view'
                                }
                            ],
                            'platform': 'skype',
                            'subtitle': searchResult.short_description,
                            'title': 'Knowledge Base Article',
                            'type': 1
                        },
                        {
                            'platform': 'skype',
                            'replies': [
                                'Yes',
                                'No'
                            ],
                            'title': 'Did this resolve your issue? (nerd)',
                            'type': 2
                        }
                    ]
                }

                resolve(result)
            }
        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createKnowledgeBaseResponse' + error)
            reject(error)
        }
    })
}

/**
    This function creates a response that can be consumed by api.ai (Dialogflow)
    @param check_catalog_data - This should be the raw data (in JSON format) that comes back from ServiceNow
    @retun - Promise. Resolves to a response or the raw error data
*/
function createRequestConfirmationResponse(check_catalog_data, item_count) {
    // console.log(check_catalog_data)
    return new Promise((resolve, reject) => {
        try {
            if (check_catalog_data.result.length === 1) {
                var result
                var subtitle = ''
                var title = ''
                for (let searchResult of check_catalog_data.result) {
                    // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
                    // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
                    if (item_count <= 1) {
                        subtitle = '(nod) Sure! I will open a request for this item. Is this correct?'
                        title = searchResult.sys_name
                    } else {
                        subtitle = '(nod) Sure! I will open a request for these items. Is this correct?'
                        title = item_count + ' ' + searchResult.sys_name + 's'
                    }
                    result = {
                        'speech': 'Catalog Confirmation',
                        'displayText': 'Catalog Confirmation',
                        'messages': [
                            {
                                'buttons': [
                                    {
                                        'postback': 'Yes',
                                        'text': 'Yes'
                                    },
                                    {
                                        'postback': 'No',
                                        'text': 'No'
                                    }
                                ],
                                'imageUrl': searchResult.image,
                                'platform': 'skype',
                                'subtitle': subtitle,
                                'title': title,
                                'type': 1
                            }
                        ]
                    }

                    resolve(result)
                }
            } else {
                result = {
                    'speech': 'Catalog Confirmation',
                    'displayText': 'Catalog Confirmation',
                    'messages': [
                        {
                            'platform': 'skype',
                            'speech': 'Sorry, that item is not in our Product Catalog. Might it have a different name?',
                            'type': 0
                        }
                    ]
                }

                resolve(result)
            }

        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createRequestConfirmationResponse' + error)
            reject(error)
        }
    })
}

/**
    This function creates a response that can be consumed by api.ai (Dialogflow)
    @param create_req_data - This should be the raw data (in JSON format) that comes back from ServiceNow
    @retun - Promise. Resolves to a response or the raw error data
*/
function createRequestCreationResponse(create_req_data) {
    return new Promise((resolve, reject) => {
        try {
            // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
            // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
            var result = {
                'speech': 'Reqeuest Confirmation',
                'displayText': 'Reqeuest Confirmation',
                'messages': [
                    {
                        'platform': 'skype',
                        'speech': 'Fantastic! (highfive) Your request number is ' + `<a href="${baseurl + reqQueryUri + create_req_data.result.number}">${create_req_data.result.number}</a>` + '.',
                        'type': 0
                    }
                ]
            }

            resolve(result)
        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createRequestCreationResponse' + error)
            reject(error)
        }
    })
}

/**
    This function creates a response that can be consumed by api.ai (Dialogflow)
    @param approval_items_data - This should be the raw data (in JSON format) that comes back from ServiceNow
    @retun - Promise. Resolves to a response or the raw error data
*/
function createPendingApprovalsResponse(approval_items_data) {
    // console.log(approval_items_data)
    return new Promise((resolve, reject) => {
        try {
            // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
            // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
            var result = {
                'speech': 'Pending approvals response',
                'displayText': 'Pending approvals response',
                'messages': [
                    {
                        'platform': 'skype',
                        'speech': 'You have ' + approval_items_data.result.length + ' requests to approve.',
                        'type': 0
                    },
                    {
                        'platform': 'skype',
                        'replies': [
                            'Yes',
                            'No'
                        ],
                        'title': 'Would you like to review them now?',
                        'type': 2
                    }
                ]
            }

            resolve(result)
        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createPendingApprovalsResponse' + error)
            reject(error)
        }
    })
}

function createNextApprovalResponse(item_data) {
    return new Promise((resolve, reject) => {
        try {
            // console.log(item_data.result)
            var name = item_data.result[0].opened_by.display_value
            var type = item_data.result[0].sys_class_name
            var short_description = item_data.result[0].short_description
            var priority = item_data.result[0].priority
            var number = item_data.result[0].number
            var sys_id = item_data.result[0].sys_id
            var url = baseurl + reqQueryUri + sys_id

            var response = name + ' seeks approval for ' + type + ':\n'
                            + short_description + '\n'
                            + 'Priority: ' + priority + ' \n'
                            + '<a href="' + url + '">' + number + '</a>'
            var result = {
                'speech': 'Processing approvals response',
                'displayText': 'Processing approvals response',
                'messages': [
                    {
                        'platform': 'skype',
                        'speech': response,
                        'type': 0
                    },
                    {
                        'platform': 'skype',
                        'replies': [
                            'Approve',
                            'Reject',
                            'Skip'
                        ],
                        'title': 'Do you approve?',
                        'type': 2
                    }
                ]
            }

            resolve(result)
        } catch (error) {
            console.log(Date() + ': ' + 'Error generating reply message for api.ai in createPendingApprovalsResponse' + error)
            reject(error)
        }
    })
}
