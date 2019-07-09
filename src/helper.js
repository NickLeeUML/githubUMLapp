import UITest from './uitest/index.js';
import '@babel/polyfill';

async function initiate_check_run(req) {
    const owner = 'NickLeeUML';
    const repo = 'selenium-library';
    const name = 'Nicks Check';
    const check_run_id = req.body.check_run.id;
    let status = 'in_progress';
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
    });
    status = 'completed';
    const conclusion = 'success';
    date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let completed_at = date;

    const test = new UITest('Amaan was here');
    const result = await test.start();

    switch (result) {
        case 'differences':
            console.log('differences');
            break;
        case 'no differences':
            console.log('no differences');
            break;
        default:
            console.log('Not match');
    }

    app.checks.update({
        owner,
        repo,
        name,
        check_run_id,
        status,
        conclusion,
        completed_at,
    });
}

function create_check_run(req) {
    const owner = 'NickLeeUML';
    const repo = 'selenium-library';
    const name = 'Nicks Check';
    const head_sha = req.body.pull_request.head.sha;

    const app = req.body.installationApp;
    app.checks.create({
        owner,
        repo,
        name,
        head_sha,
    });
}

module.exports = {
    initiate_check_run: initiate_check_run,
    create_check_run: create_check_run,
};
