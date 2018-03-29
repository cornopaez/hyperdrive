const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const routes = require("./controllers/routes.js")
const DIST_FOLDER = process.cwd() + '/dist'

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Static files
app.use(express.static(DIST_FOLDER))

// Main router -- ****OTHER ROUTERS NEED TO BE ABOVE THIS LINE!!!!******
app.use("/", routes)

const port = process.env.PORT? process.env.PORT : 3000

app.listen(port, () => console.log('Hyperdrive up and running on port ' + port))