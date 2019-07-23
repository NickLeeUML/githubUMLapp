import UITest from './uitest/index.js';
import '@babel/polyfill';

async function initiate_check_run(req) {
    const owner = 'NickLeeUML';
    const repo = 'sampleapp';
    const name = 'Nicks Check';
    const check_run_id = req.body.check_run.id;
    let status = 'in_progress';
    let date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let started_at = date;

    const app = req.body.installationApp;

    ( async () => { 
        await app.checks.update({
            owner,
            repo,
            name,
            check_run_id,
            status,
            started_at,
        });
    })()

    
 
    try {
        const test = new UITest('00004');
        const result = await test.start();
        console.log("result: ", result)

        status = 'completed';
        const conclusion = 'success';
        date = new Date();
        date.toISOString(); //"2011-12-19T15:28:46.493Z"
        let completed_at = date;

        ( async () => {
            await app.checks.update({
                owner,
                repo,
                name,
                check_run_id,
                status,
                conclusion,
                completed_at,
            });
        })()


    }catch(e){


        const status = 'completed';
        const conclusion = 'failure';
        let date = new Date();
        date.toISOString(); //"2011-12-19T15:28:46.493Z"
        let completed_at = date;

        ( async () => {
            await app.checks.update({
                owner,
                repo,
                name,
                check_run_id,
                status,
                conclusion,
                completed_at,
            });
        })()


    }
    



    status = 'completed';
    const conclusion = 'success';
    date = new Date();
    date.toISOString(); //"2011-12-19T15:28:46.493Z"
    let completed_at = date;

    // switch (result) {

    //     case 'differences':
    //         console.log('differences');
    //         break;


    //     case 'no differences':
    //         console.log('no differences');
    //         break;

    //     default:
    //         console.log('Not match');
    //         ( async () => {
    //             await app.checks.update({
    //                 owner,
    //                 repo,
    //                 name,
    //                 check_run_id,
    //                 status,
    //                 conclusion,
    //                 completed_at,
    //             });
    //         })()
            
    // }



 
    
}

function create_check_run_from_pullrequest(req) {
    const owner = 'NickLeeUML';
    const repo = "sampleapp";
    const name = 'Nicks Check';
    const head_sha = req.body.pull_request.head.sha;
    const app = req.body.installationApp;
    try {
        app.checks.create({
            owner,
            repo,
            name,
            head_sha,
        });
    } catch(err) {
        console.log("THERE WAS AN ERROR, ", err)   
    }
 
}

function create_check_run_from_check_suite(req) {
    console.log("create check run from check suite event ")
    // const owner = 'NickLeeUML';
    // let repo = '';
    // const name = 'Nicks Check';


    // const head_sha = req.body.pull_request.head.sha;

    

    // const app = req.body.installationApp;
    // try {
    //     app.checks.create({
    //         owner,
    //         repo,
    //         name,
    //         head_sha,
    //     });
    // } catch(err) {
    //     console.log("THERE WAS AN ERROR, ", err)   
    // }
 
}




module.exports = {
    initiate_check_run: initiate_check_run,
    create_check_run_from_pullrequest: create_check_run_from_pullrequest,
    create_check_run_from_check_suite,create_check_run_from_check_suite
};
