
const request = require('request')
const btoa = require('btoa')
const argv = require('yargs').argv
const urlencode = require('urlencode')
const baseurl = "https://gpietro3demo.service-now.com"
auth = 'Basic '+btoa(`${argv.username||process.env.username}`+':'+`${argv.password||process.env.password}`)

var search_string = urlencode(argv.search_string)
var options = {
  uri: baseurl + `/api/now/table/kb_knowledge?sysparm_query=123TEXTQUERY321%3D${search_string}&sysparm_limit=3&workflow_state=published`,
  method: 'GET',
  json: true,
  headers: {
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
