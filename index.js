const express = require('express');
const octokitRequest = require('@octokit/rest');
const { request } = require('@octokit/request');
const jsonwebtoken = require('jsonwebtoken');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const util = require('util');
const fs = require('fs');
require('dotenv').config();

const { InstallationAccessTokenPromise } = require("./auth.js");
const { 
    initiate_check_run,
    create_check_run 
 } = require("./helper.js");


const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req,res,next) => {
    fs.writeFile("julyrequestlog", util.inspect(req, false, null, true /* enable colors */),(err) => {
        if(err){return console.log(err);}
        console.log("file saved");
    });
    next();
});

app.use(verify_webhook_signature);

app.use(async (req,res,next) => {
    const token = await InstallationAccessTokenPromise(req.body.installation.id);
    const installationApp = await new octokitRequest({auth: token});
    req.body['installationApp'] = installationApp;
    next();
})

//By default, GitHub creates a check suite automatically when code is pushed to the repository. This default flow sends the check_suite event (with requested action) to all GitHub App's that have the checks:write permission.

app.post('/events', async (req, res) => {  //smee server forwarding to here
    const event = req.headers['x-github-event'];   //https://developer.github.com/v3/activity/events/types/
    switch (event) {

        case 'pull_request':    // on pull requests start check run
            create_check_run(req);
            break;

        case 'check_suite':    // on pushes create check run
            create_check_run(req);
            break;    

        case 'check_run':            
            if(req.body.check_run.check_suite.app.id.toString() === process.env.GITHUB_APP_IDENTIFIER){
                switch(req.body.action) {
                    case 'created':
                        initiate_check_run(req);
                        break;
                    case 'rerequested': 
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
            }
            
            break;

        default:
            break;
    }
})

app.listen(port, () => console.log(`Running ${port}!`))

// see https://developer.github.com/webhooks/securing/

function verify_webhook_signature(req,res,next){
    next();
}
