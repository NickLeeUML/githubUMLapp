import express  from 'express';
import { App }  from '@octokit/app'; // used to get auth tokens for use with, avoids having to use 'jsonwebtoken'
import octokitRequest  from '@octokit/rest';
import jsonwebtoken  from 'jsonwebtoken';
import "@babel/polyfill";
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import https from'https';

const PEM = fs.readFileSync( path.join(__dirname + '/../umlapp.2019-06-11.private-key.pem') , 'utf8');
const ISSUER_ID = process.env.GITHUB_APP_IDENTIFIER;
const APP_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

function generateJwtToken() {
    // will generate a JWT that will expire in like 10 minutes
    return jsonwebtoken.sign(
        {
            iat: Math.floor(new Date() / 1000),
            exp: Math.floor(new Date() / 1000) + 300,
            iss: ISSUER_ID,
        },
        PEM,
        { algorithm: 'RS256' }
    );
}

async function authApp() {
    //authenticates as an app and gets an installation id based on supplied username
    const clientWithAuth = await new octokitRequest({ auth: generateJwtToken() });
    const data = await clientWithAuth.apps.listInstallations();
    console.log('Instalations: ', data);
    const result = await clientWithAuth.apps.getUserInstallation({
        username: 'NickLeeUML',
    });
    console.log(result);
}

async function authenticateAppliction() {
    // returns and authorized instance of the app, going to be used as middleware  on each request
    const app = await new octokitRequest({ auth: generateJwtToken() });
    return app;
}

async function getUserInstallation(authenticateApp, username) {
    //returns user installation id, also found on when user sign ups,
    const result = await authenticateApp.apps.getUserInstallation({
        username: 'NickLeeUML',
    });
    return result.data.id; //  contains installation id used to authenticate as an installation
}

async function getUserInstallationWithAppjs() {
    const app = new App({ id: ISSUER_ID, privateKey: PEM });
}

async function InstallationAccessToken(id) {
    //
    const app = new App({ id: ISSUER_ID, privateKey: PEM }); // app is an authenticated app,  is this the same as  'new octokitRequest({auth: generateJWtToken}) ?
    app.getInstallationAccessToken({
        installationId: id,
    })
        .then((data) => {
            return data;
        })
        .catch((e) => {
            console.log('error with installation access token', e);
        });
}

function InstallationAccessTokenPromise(id) {
    //
    return new Promise((resolve, reject) => {
        const app = new App({ id: ISSUER_ID, privateKey: PEM }); // app is an authenticated app,  is this the same as  'new octokitRequest({auth: generateJWtToken}) ?
        app.getInstallationAccessToken({
            installationId: id,
        })
            .then((data) => {
                resolve(data);
            })
            .catch((e) => {
                console.log('error with installation access token', e);
                reject(e);
            });
    });
}

async function auth() {
    const clientWithAut = await new octokitRequest({ auth: generateJwtToken() });

    const {
        data: { token },
    } = await clientWithAut.apps.createInstallationToken({
        installation_id: '1164645',
    });
    return await clientWithAut.authenticate({ type: 'token', token });
}

module.exports = {
    InstallationAccessTokenPromise,
};

async function main() {
    const a = await authenticateAppliction();
    const b = await getUserInstallation(a);
    InstallationAccessToken(b);
}

/*
 two ways to auth 

    1) use '@octokit/rest' to create and authed app to use to get installatin token for further request, requires making jwt

        const AuthedApp = await new octokitRequest({auth: generateJwtToken()})
        const { data: {token} } =  await AuthedApp.apps.createInstallationToken({
            installation_id: '1164645',
        })
    2) use @octokit/app' supplying pem and app id to auth and auto get installation token 
        see function InstallationAccessToken(){}

*/
