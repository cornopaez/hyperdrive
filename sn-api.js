
const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const urlencode = require('urlencode')
const baseurl = "https://gpietro3demo.service-now.com"
const dotenv = require('dotenv').config()
var auth = 'Basic ' + btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

// console.log(`${process.env.username} ${process.env.password}`)

var search_string = '123TEXTQUERY321%3D' + urlencode(argv.search_string) // Beginning of string necessary for query to work

var options = { 
  method: 'GET',
  url: 'https://gpietro3demo.service-now.com/api/now/table/kb_knowledge',
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
      console.log(` ${short_description} \n `+ baseurl + `/nav_to.do?uri=%2Fkb_view.do%3Fsys_kb_id%3D${result.sys_id}`)
    }
  } else {
    console.log(`Error: ${error} Status Code: ${response.statusCode}`)
  }
}

request(options, callback);
