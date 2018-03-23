const express = require("express");
const connection = require("./mongo-connection.js");

module.exports = {
	getProjectView : getProjectView,
	getProjectsCards: getProjectsCards,
	postContactRequest: postContactRequest
}

function getProjectView(projectName) {

	return new Promise((resolve, reject) => {
		var db = connection.getDb();
		var query = {'project_name' : projectName};
		var projection = {
			'_id': 0,
			'view': 1
		}
		var cursor = db.collection('projects').find(query).project(projection)
		// var response

		cursor.toArray((err, docs) => {
			// console.log(docs)
			if (docs === null || docs === undefined) {
				// res.redirect("/error");
				reject('Meine Damen und Herren, dieser Inhalt ist verboten')
			} else {
				resolve(docs)
			}
		});
	})
}