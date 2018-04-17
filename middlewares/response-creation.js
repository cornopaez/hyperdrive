const {baseurl, kburi} = require('./sn-api.js')

module.exports = {
	createKnowledgeBaseResponse: createKnowledgeBaseResponse
}

/**
	This function creates a response that can be consumed by api.ai (Dialogflow)
	@param kb_data - This should be the raw data (in JSON format) that comes back from ServiceNow
					containing the 
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
	        console.log(Date() + ': ' + 'Error generating reply message for api.ai in search_kb' + error)
	        reject(error)
	    }
	})
}