const express = require('express')
const octokit = require('@octokit/rest')
const { App } = require('@octokit/app')
const jsonwebtoken = require('jsonwebtoken')
require('dotenv').config()
var fs = require('fs');
const https = require('https');

const PEM = fs.readFileSync('./umlapp.2019-06-11.private-key.pem', 'utf8');
const ISSUER_ID = process.env.GITHUB_APP_IDENTIFIER;
const APP_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

function generateJwtToken(){  // will generate a JWT that will expire in like 10 minutes
    return jsonwebtoken.sign({
        iat: Math.floor(new Date() / 1000),
        exp: Math.floor(new Date() / 1000) + 600,
        iss: ISSUER_ID,
    },
    PEM,
    { algorithm: 'RS256'}
 )
}

async function authApp(){  //lets instalations of my app, and gets an installation id 
    const clientWithAuth = await new octokit({auth: generateJwtToken()})
    const data = await clientWithAuth.apps.listInstallations()
    console.log("Instalations: ", data)
    const result = await  clientWithAuth.apps.getUserInstallation({
        'username' : "NickLeeUML"
      })
    console.log("result:? ", result)
}


async function authenticateAppliction(){  //going to be used as middleware  on each reques 
   const app = await new octokit({auth: generateJwtToken()})
   return app;
}

async function getUserInstallation(authenticateApp, username){  //returns user installation id 
    const result = await  authenticateApp.apps.getUserInstallation({
        'username' : "NickLeeUML"
      })
    return result.data.id
}

async function InstallationAccessToken(id){
    const app = new App({ id: ISSUER_ID, privateKey: PEM })
    app.getInstallationAccessToken({
        installationId: id
    }).then(data=>{
        return data;
    })
    .catch(e=>{
        console.log('error with installation access token', e)
    })
}

function authenticateInstallation(installation_id){
}

module.exports = {
    authenticateAppliction: authenticateAppliction,
    InstallationAccessToken: InstallationAccessToken,
    getUserInstallation, getUserInstallation

};

async  function main(){
    const a = await authenticateAppliction()
    const b  = await getUserInstallation(a)
    InstallationAccessToken(b)
}

//main()


//authApp();

// async function auth(){
//     const clientWithAut = await new octokit({auth: generateJwtToken()})

//     const { data: {token} } =  await clientWithAut.apps.createInstallationToken({
//         installation_id: '1147117',
//     })
//     clientWithAut.authenticate({type: 'token', token})
// }

// const options = {
//     hostname: 'https://api.github.com',
//     path: '/users/NickLeeUML/instalation'
// }