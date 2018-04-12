const express = require('express')
const router = express.Router()
const dotenv = require('dotenv').config() // eslint-disable-line 
const intents = require('../middlewares/intent-processing.js')

module.exports = router

router.post('/webhook', (req, res) => {
    console.log(JSON.stringify(req.body))
    intents.processIntent(req.body)
        .then(success => {
            console.log(success)
            res.setHeader('Content-Type', 'application/json')
            res.send(success)
        })
        .catch(data => {
            console.log('processIntent error!')
            res.status(data.statusCode ? data.statusCode : 500).send(data.body ? data.body : 'Fatal error.')
        })
})

router.get('/', (req, res) => res.send('I\'m up and running!'))
