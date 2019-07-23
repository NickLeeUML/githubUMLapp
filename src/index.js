import express from 'express';
import octokitRequest from '@octokit/rest';
import { request } from '@octokit/request';
import jsonwebtoken from 'jsonwebtoken';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import util from 'util';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

import '@babel/polyfill';

import { InstallationAccessTokenPromise } from './auth.js';
import { initiate_check_run, create_check_run_from_pullrequest } from './helper.js';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
    fs.writeFile('julyrequestlog', util.inspect(req, false, null, true /* enable colors */), (err) => {
        if (err) {
            return console.log(err);
        }
        console.log('file saved');
    });
    next();
});

app.use(verify_webhook_signature);

app.use(async (req, res, next) => {
    const token = await InstallationAccessTokenPromise(req.body.installation.id);
    const installationApp = await new octokitRequest({ auth: token });
    req.body['installationApp'] = installationApp;
    next();
});

//By default, GitHub creates a check suite automatically when code is pushed to the repository. This default flow sends the check_suite event (with requested action) to all GitHub App's that have the checks:write permission.

app.post('/events', async (req, res) => {
    //smee server forwarding to here
    const event = req.headers['x-github-event']; //https://developer.github.com/v3/activity/events/types/
    console.log('x-github-event: ', event)
    switch (event) {
        case 'pull_request': // Triggered when a pull request is assigned, unassigned, labeled, unlabeled, opened, edited, closed, reopened, synchronize, ready_for_review, locked, unlocked or when a pull request review is requested or removed.
            console.log('pull request')
            create_check_run_from_pullrequest(req);
            break;

        case 'check_suite': // Triggered when a check suite is completed, requested, or rerequested.  Also when commit is pushed
            console.log('check suite ')
            // create_check_run(req);  // add a check run to that  suit 
            break;

        case 'create':  // new branch is created
            break;

        case 'push':   // push is created 
            break;   

        case 'check_run': //Triggered when a check run is created, rerequested, completed, or has a requested_action.
            if (req.body.check_run.check_suite.app.id.toString() === process.env.GITHUB_APP_IDENTIFIER) {

                switch (req.body.action) {
                    case 'created':
                        console.log("case: 'check_run' case: 'created' ")
                        initiate_check_run(req);  // start ui test 
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
});

app.listen(port, () => console.log(`Running ${port}!`));

// see https://developer.github.com/webhooks/securing/

function verify_webhook_signature(req, res, next) {
    next();
}
