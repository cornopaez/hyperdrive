const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const urlencode = require('urlencode')
const baseurl = "https://gpietro3demo.service-now.com"
const dotenv = require('dotenv').config()
const searchuri = '/api/now/table/kb_knowledge'
const userUri = '/api/now/table/sys_user'
const incidentUri = '/api/now/table/incident'
const kburi = `/nav_to.do?uri=%2Fkb_view.do%3Fsys_kb_id%3D`
const auth = 'Basic ' + btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

// module.exports.search = search
// module.exports.getUserDetails = getUserDetails
module.exports = {
  search: search,
  getUserDetails: getUserDetails,
  getIncidentDetails: getIncidentDetails,
  closeIncident: closeIncident
}

/**
  This function searches the configured ServiceNow endpoint. It returns a Promise that resolves the data as plain text or provides
  the error occured.

  @param search_string - A single string of text to be searched for
  @return - Promise. Resolves to plain text from relevant articles returned.
*/
function search(search_string) {

  return new Promise((resolve, reject) =>{

    var search_query = '123TEXTQUERY321=' + urlencode(search_string) // Beginning of string necessary for query to work

    var options = { 
      method: 'GET',
      uri: baseurl + searchuri,
      qs: { 
        sysparm_query: search_query,
        sysparm_limit: '3',
        workflow_state: 'published' 
      },
      json: true,
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: auth 
      } 
    }

    request(options, (error, response, body) => {
      var search_results = ""
      if (!error && response.statusCode == 200) {
        for (let result of body.result) {
          var short_description = JSON.stringify(result.short_description)
          search_results = search_results + ` ${short_description} \n `+ baseurl + kburi + result.sys_id + "\n"
        }
      } else {
        reject(response)
      }
      resolve(search_results)
    })
  })
}

function getUserDetails(email_address) {


  return new Promise((resolve, reject) => {
    var options = { 
      method: 'GET',
      uri: baseurl + userUri,
      qs: { 
        sysparm_query: 'email=' + email_address,
        sysparm_limit: '1' //This can be changed to suit our needs 
      },
      headers: { 
        'Cache-Control': 'no-cache',
        Authorization: auth 
      } 
    };

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
          // console.log(response)
          reject(response)
        }
      })        
    })
    .catch(error => {
      // If incident number comes up empty, handle error
      var response = {
            statusCode: 500,
            body: {
              message: 'Error: Could not close incident. Incident number is invalid. Please try again.'
            }
          }
      reject(response)
    })
  })
}