const express = require('express')
const octokit = require('@octokit/rest')
const jsonwebtoken = require('jsonwebtoken')
const bodyParser = require('body-parser')
const {authenticateAppliction,InstallationAccessToken} = require("./auth.js")
require('dotenv').config()

let authedApp;
let authedInstallation; 

const PEM = process.env.PRIVATE_KEY
const ISSUER_ID = process.env.GITHUB_APP_IDENTIFIER
const APP_SECRET = process.env.GITHUB_WEBHOOK_SECRET

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(auth)

app.use(async (req,res,next)=>{
    authedApp = await authenticateAppliction()
    InstallationAccessToken(req.body.installation.id)
})

app.get('/events', (req, res)=>{
    console.log("hit get event handler route")
    res.sendStatus(200)
})

app.post('/event_handler', (req, res)=>{
    console.log("hit post event handler route ")
})

app.listen(port, () => console.log(`Running ${port}!`))

// see https://developer.github.com/webhooks/securing/
function verify_webhook_signature(req,res,next){
    next()
}
