const express = require('express');
const octokitRequest = require('@octokit/rest');
const { request } = require('@octokit/request');
const jsonwebtoken = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { InstallationAccessTokenPromise } = require("./auth.js");
const chalk = require('chalk');
const util = require('util');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req,res,next) => {
    fs.writeFile("requestlog", util.inspect(req, false, null, true /* enable colors */),(err) => {
        if(err){return console.log(err);}
        console.log("file saved");
    });
    next();
});

app.use(verify_webhook_signature)

app.use(async (req,res,next) => {
    const token = await InstallationAccessTokenPromise(req.body.installation.id)
    const installationApp = await new octokitRequest({auth: token})
    req.body['installationApp'] = installationApp;
    next();
})

app.post('/events', async (req, res) => {
    const event = req.headers['x-github-event']; 
    console.log('x-github-event: ', event);
    switch (event) {
        case 'pull_request':
            create_check_run(req);
            break;
        case 'check_run':
            console.log('req.body.action: ', req.body.action);
            switch(req.body.action) {
                case 'rerequested': 
                    console.log('rerequested');
                    break;
                case 'created':
                    console.log('created');
                    initiate_check_run(req);
                    break;
                case 'completed':
                    console.log('completed');
                    break;
                case 'requested_action':
                    console.log('requested_action');
                    break;
                case 'reopened':
                    break;
                default: 
                    console.log('default check run');
                    break;
            }
            break;
        default:
            break;
    }
})

app.listen(port, () => console.log(`Running ${port}!`))

// see https://developer.github.com/webhooks/securing/

function verify_webhook_signature(req,res,next){
    next()
}

function create_check_run(req){

    const owner = "NickLeeUML";
    const repo = "selenium-library";  
    const name = "Nicks Check";
    const head_sha = req.body.pull_request.head.sha;
    
    const app = req.body.installationApp; 
    app.checks.create({
        owner,
        repo,
        name,
        head_sha        
    })
}

async function initiate_check_run(req){
    const owner = "NickLeeUML";
    const repo = "selenium-library";
    const name = "Nicks Check";
    const check_run_id = req.body.check_run.id;
    let status = "in_progress";
    let date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let started_at = date;

    const app = req.body.installationApp; 

    app.checks.update({
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

    app.checks.update({
        owner,
        repo,
        name,
        check_run_id,
        status,
        conclusion,
        completed_at,
    })
}
