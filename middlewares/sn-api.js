const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const urlencode = require('urlencode')
const baseurl = "https://gpietro3demo.service-now.com"
const dotenv = require('dotenv').config()
const searchuri = '/api/now/table/kb_knowledge'
const userUri = '/api/now/table/sys_user'
const kburi = `/nav_to.do?uri=%2Fkb_view.do%3Fsys_kb_id%3D`
const auth = 'Basic ' + btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

module.exports.search = search
module.exports.getUserDetails = getUserDetails

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
        resolve(body)
      } else {
        console.log('request error!')
        // console.log(response)
        reject(response)
      }
    })
  })
}
