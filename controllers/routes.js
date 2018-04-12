const express = require('express')
const router = express.Router()
const dotenv = require('dotenv').config() // eslint-disable-line 
const { search, processIntent } = require('../middlewares/sn-api') // eslint-disable-line

module.exports = router

router.post('/webhook', (req, res) => {
    console.log(req.body)
    res.sendStatus('200')
})

router.post('/search', (req, res) => {
    // console.log("search requested for " + JSON.stringify(req.body))

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
            res.status(data.statusCode ? data.statusCode : 500).send(data.body ? data.body : 'Fatal error.')
        })
})

router.get('/', (req, res) => res.send('I\'m up and running!'))
