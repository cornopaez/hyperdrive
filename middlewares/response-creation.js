const {baseurl, kburi} = require('./sn-api.js')

module.exports = {
	createKnowledgeBaseResponse: createKnowledgeBaseResponse,
	createRequestConfirmationResponse: createRequestConfirmationResponse
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
function createRequestConfirmationResponse(check_catalog_data) {
	return new Promise((resolve, reject) => {
		try {
	        for (let searchResult of check_catalog_data.result) {
	            // console.log(Date() + ': ' + 'Search Result: ' + searchResult.short_description)
	            // console.log(Date() + ': ' + 'Search Result ID: ' + searchResult.sys_id)
	            var result = {
	                'speech': 'Catalog Confirmation',
	                'displayText': 'Catalog Confirmation',
	                'messages': [
	                    {
	                        'platform': 'skype',
	                        'speech': 'Sure! I will open a software request for you for ' + searchResult.sys_name + '.',
	                        'type': 0
	                    },
	                    {
	                        'platform': 'skype',
	                        'replies': [
	                            'Yes',
	                            'No'
	                        ],
	                        'title': 'Is this absolutely correct?',
	                        'type': 2
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