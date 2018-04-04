const express = require("express")
const router = express.Router()
const dotenv = require('dotenv').config()
const DIST_FOLDER = process.cwd() + '/dist'
const search = require('../middlewares/sn-api.js').search

module.exports = router

router.post('/webhook', (req, res) => {
	console.log(req.body)
	queryDb.postRequest(req.body)
	.then(success => {
		res.json(success)
	})
	.catch(error => {
		res.json(error)
	})
})

router.post('/search', (req, res) => {
	console.log("search requested for " + JSON.stringify(req.body))

	/**
		The search function is looking for a specific parameter in the data being passed,
		based on the data passed from API.AI (Webdialog)
		Adjust accordingly if necessary.
	*/
	search(req.body.resolvedQuery)
	.then(success => {
		// console.log(success)
		res.send(success)
	})
	.catch(data => {
		// console.log(error)
		res.send(error)
	})
})

router.get('/', (req, res) => res.send('I\'m up and running!'))
