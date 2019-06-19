const express = require('express')
const octokitRequest = require('@octokit/rest')
const { request } = require('@octokit/request')
const jsonwebtoken = require('jsonwebtoken')
const bodyParser = require('body-parser')
const {authenticateAppliction,InstallationAccessToken,auth,generateJwtToken} = require("./auth.js")
const chalk = require('chalk');
const util = require('util')
const fs = require('fs');

require('dotenv').config()

let authedApp;
let authedInstallation; 

const PEM = process.env.PRIVATE_KEY
const ISSUER_ID = process.env.GITHUB_APP_IDENTIFIER
const APP_SECRET = process.env.GITHUB_WEBHOOK_SECRET

const app = express()
const port = 3000

app.use(bodyParser.json())

// app.use(function(req,res,next){
//     console.log(util.inspect(req, false, null, true /* enable colors */))
//     fs.writeFile("requestlog", util.inspect(req, false, null, true /* enable colors */), function(err){
//         if(err){return console.log(err)}
//         console.log("file saved")
//     })
//     console.log("Incomming request: ", util.inspect(req, false, null, true /* enable colors */))
//     next()
// })


app.use(async (req,res,next)=>{
    authedApp = await authenticateAppliction()
    InstallationAccessToken(req.body.installation.id)
    req.body["authedApp"] = authedApp;
    next();
})

app.post('/events', async (req, res)=>{
    const event = req.headers['x-github-event']; 
    console.log("Event: ", event);

    switch (event) {
        case 'pull_request':
            console.log("create run check")

            const AuthedApp = await new octokitRequest({auth: generateJwtToken()})

            const { data: {token} } =  await AuthedApp.apps.createInstallationToken({
                installation_id: '1164645',
            })
            
            const owner = "NickLeeUML";
            const repo = "selenium-library";  
            const name = "Nicks Check";
            const head_sha = req.body.pull_request.head.sha;
            
            // can either do this 
            // await request("POST /repos/:owner/:repo/check-runs",{
            //     owner: owner,
            //     repo: repo,
            //     head_sha: head_sha,
            //     name: name,
            //     headers: {
            //         authorization: `token ${token}`,
            //         accept: "application/vnd.github.antiope-preview+json"
            //     },
            // })

            //or this 
            const app = await new octokitRequest({auth: token})


            app.checks.create({
                owner,
                repo,
                name,
                head_sha
        
            })
           // createCheckrun(app,req)

        case 'check_run':
            console.log("req.body.action: ", req.body.action)
            switch(req.body.action) {
                case 'rerequested': 
                    console.log('rerequested')
                    console.log(req.body)
                    break;
                case 'created':
                    initiate_check_run(req)
                    console.log('created')
                    break;
                case 'completed':
                    console.log('completed')
                    break;
                case 'requested_action':
                    console.log('requested_action')
                    break;
            }
        default:
    }

})

app.post('/event_handler', (req, res)=>{
})

app.listen(port, () => console.log(`Running ${port}!`))

// see https://developer.github.com/webhooks/securing/
function verify_webhook_signature(req,res,next){
    next()
}

function createCheckrun(authedInstallation,req){
    const owner = "NickLeeUML";
    const repo = "selenium-library";  
    const name = "Nicks Check";
    const head_sha = req.body.pull_request.head.sha;

    authedInstallation.checks.create({
        owner,
        repo,
        name,
        head_sha

    })
}

async function initiate_check_run(req){

    
    const AuthedApp = await new octokitRequest({auth: generateJwtToken()})
    const { data: {token} } =  await AuthedApp.apps.createInstallationToken({
        installation_id: '1164645',
    })
    
    const owner = "NickLeeUML";
    const repo = "selenium-library";  
    const name = "Nicks Check";
    const check_run_id = req.body.check_run.id;
    let status = "in_progress";
    let date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let started_at = date;

    const installation = await new octokitRequest({auth: token})

    

    installation.checks.update({
        owner,
        repo,
        name,
        check_run_id,
        status,
        started_at,
    })
    

    //do ci test here
    
    status = "completed";
    const conclusion = "success";
    date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let completed_at = date;

    installation.checks.update({
        owner,
        repo,
        name,
        check_run_id,
        status,
        conclusion,
        completed_at,
    })

    // await request("PATCH /repos/:owner/:repo/:check-runs/:chrck_run_id",{
    //     owner,
    //     repo,
    //     check_run_id,
    //     headers: {
    //         authorization: `token ${token}`,
    //         accept: "application/vnd.github.antiope-preview+json"
    //     },
    // })
}