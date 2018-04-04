const express = require("express")
const router = express.Router()
const dotenv = require('dotenv').config()
const DIST_FOLDER = process.cwd() + '/dist'
const search = require('../middlewares/sn-api.js').search
const processIntent = require('../middlewares/intent-processing.js').processIntent

module.exports = router

router.post('/webhook', (req, res) => {
	// console.log(req.body)
	queryDb.postRequest(req.body)
	.then(success => {
		res.json(success)
	})
	.catch(error => {
		res.status(error.statusCode).send(error.body)
	})
})

router.post('/search', (req, res) => {
	console.log("search requested for " + JSON.stringify(req.body))

	/**
		The search function is looking for a specific parameter in the data being passed,
		based on the data passed from API.AI (Webdialog)
		Adjust accordingly if necessary.
	*/
	processIntent(req.body)
	.then(success => {
		// console.log(success)
		res.send(success)
	})
	.catch(data => {
		console.log('processIntent error!')
		res.status(data.statusCode).send(data.body)
	})
})

router.get('/', (req, res) => res.send('I\'m up and running!'))
