const express = require('express')
const router = express.Router()
const dotenv = require('dotenv').config() // eslint-disable-line 
const intents = require('../middlewares/intent-processing')

module.exports = router

router.post('/webhook', (req, res) => {
    console.log(Date() + ': ' + JSON.stringify(req.body.result.action))
    intents.processIntent(req.body)
        .then(success => {
            console.log(Date() + ': ' + 'Intent Processing finished successfully.')
            res.setHeader('Content-Type', 'application/json')
            res.send(success)
        })
        .catch(data => {
            console.log(Date() + ': ' + 'Intent Processing Error!\n')
            console.log(Date() + ': ' + JSON.stringify(data))
            try {
                res.status(data.statusCode ? data.statusCode : 500).send(data.body ? data.body : 'Fatal error.')
            } catch (error) {
                console.log(Date() + ': ' + 'Intent Processing error in returning status to api.ai\n')
                console.log(Date() + ': ' + error)
            }
        })
})

router.get('/', (req, res) => res.send('I\'m up and running!'))
