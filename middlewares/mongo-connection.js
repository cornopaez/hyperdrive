const express = require("express");
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
var _db = null;
const dotenv = require('dotenv').config();

module.exports =  {
	getDb: getDb,
	connect: connect,
	postRequest: postRequest
}

const url = process.env.MONGODB_URI ? process.env.MONGODB_URI : process.env.MONGODB_LOCAL;

// Creates a connection to MongoDB and returns the db object.
function connect() {

	return new Promise((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			if (err) reject(err);

			var dbName = db.s.options.dbName
			// console.log(db.s.options.dbName)
			_db = db.db(dbName);
			resolve(db);
		});
	});
};

// Gets the db object created by MongoClient.connect()
function getDb() {
	// console.log(_db)
	return _db;
}

function postRequest(data){
	return new Promise((resolve, reject) => {

		_db.collection('requests').insertOne(data, (error, response) =>{
			if(error) {
				reject(error)
			} else {
				resolve(response)
			}
		})
	})
}