const express = require('express')
const connection = require('./mongo-connection.js')

module.exports = {
	postRequest : postRequest
}

function postRequest(data){
	return new Promise((resolve, reject) => {

		var db = connection.getDb()

		db.collection('requests').insertOne(data, (error, response) =>{
			if(error) {
				// console.log('error')
				reject(error)
			} else {
				// console.log('resolved')
				resolve(response)
			}
		})
	})
}