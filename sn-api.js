
const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const urlencode = require('urlencode')
const baseurl = "https://gpietro3demo.service-now.com"
const dotenv = require('dotenv').config()
const searchuri = '/api/now/table/kb_knowledge'
const kburi = `/nav_to.do?uri=%2Fkb_view.do%3Fsys_kb_id%3D`
var auth = 'Basic ' + btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

var search_string = '123TEXTQUERY321%3D' + urlencode(argv.search_string) // Beginning of string necessary for query to work

var options = { 
  method: 'GET',
  url: baseurl + searchuri,
  qs: { 
    sysparm_query: search_string,
    sysparm_limit: '3',
    workflow_state: 'published' 
  },
  json: true,
  headers: {
    'Cache-Control': 'no-cache',
    Authorization: auth 
  } 
}

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("Details: ")
    for (let result of body.result) {
      var short_description = JSON.stringify(result.short_description)
      console.log(` ${short_description} \n `+ baseurl + kburi + result.sys_id)
    }
  } else {
    console.log(`Error: ${error}`)
  }
}

request(options, callback);
