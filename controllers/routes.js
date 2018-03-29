const express = require("express")
const router = express.Router()
const dotenv = require('dotenv').config()
const DIST_FOLDER = process.cwd() + '/dist'
const search = require('../sn-api.js').search

module.exports = router

router.use('*', (req, res, next) => {
	//no need for https in an MVP right?
	return next()
})

router.post('/webhook', (req, res) => {
	// console.log(req.body)
	queryDb.postRequest(req.body)
	.then(success => {
		res.json(success)
	})
	.catch(error => {
		res.json(error)
	})
})

router.get('/', (req, res) => res.send('I\'m up and running!'))

router.post('/search', (req, res) => {
	console.log("search requested")
	console.log(search(req.body))
})
