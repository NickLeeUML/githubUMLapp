import '@babel/polyfill';
import webdriver from 'selenium-webdriver';
import { SeleniumServer } from 'selenium-webdriver/remote';
import request from 'request';

import { myUMLPopupTest_Selenium, solutionCenterWebsiteTest_Selenium } from './selenium/index.js';
import selenium from './selenium/index.js';
import { createReport } from './happo.js';

import dotenv from 'dotenv';
dotenv.config();

const variations = {
    windows10Chrome: {
        browserName: 'Chrome',
        version: '75x64',
        platform: 'Windows 10',
        screenResolution: '1366x768',
    },
    windows10Firefox: {
        browserName: 'Firefox',
        version: '67x64',
        platform: 'Windows 10',
        screenResolution: '1366x768',
    },
    windows10Edge: {
        browserName: 'MicrosoftEdge',
        version: '18',
        platform: 'Windows 10',
        screenResolution: '1366x768',
    },
    osxSafari: {
        browserName: 'Safari',
        version: '12',
        platform: 'Mac OSX 10.14',
        screenResolution: '1366x768',
    },
    osxFirefox: {
        browserName: 'Firefox',
        version: '67',
        platform: 'Mac OSX 10.14',
        screenResolution: '1366x768',
    },
    osxChrome: {
        browserName: 'Chrome',
        version: '75x64',
        platform: 'Mac OSX 10.14',
        screenResolution: '1366x768',
    },
};

async function processScripts() {
    const caps = {
        name: `${variations.osxFirefox.browserName} ${variations.osxFirefox.platform}`,
        build: '1.0',
        version: variations.osxFirefox.version,
        platform: variations.osxFirefox.platform,
        screen_resolution: '1366x768',
        record_video: 'true',
        record_network: 'false',
        browserName: variations.osxFirefox.browserName,
        username: process.env.CBT_USER_NAME,
        password: process.env.CBT_AUTHKEY,
    };

    const driver = new webdriver.Builder()
        .usingServer('http://hub.crossbrowsertesting.com:80/wd/hub')
        .withCapabilities(caps)
        .build();
    //await driver.manage().window().maximize() // works for edge
    await driver
        .manage()
        .window()
        .setRect({ width: 1200, height: 600 });

    myUMLPopupTest_Selenium(driver);
}

webdriver.WebDriver.prototype.takeSnapshot = function(sessionId) {
    return new Promise((resolve, fulfill) => {
        var result = { error: false, message: null };

        if (sessionId) {
            request
                .post('https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/snapshots', async function(error, response, body) {
                    if (error) {
                        result.error = true;
                        result.message = error;
                    } else if (response.statusCode !== 200) {
                        result.error = true;
                        result.message = body;
                    } else {
                        result.error = false;
                        result.message = 'success';
                    }
                    body = JSON.parse(body);
                    const imageURL = body.image;
                    const imageObj = { url: imageURL, variant: 'windows10edge', target: 'pc', component: 'wholepage', height: 768, width: 1366 };
                    const imageArray = [imageObj];
                    await createReport('123abc', imageArray);
                })
                .auth(process.env.CBT_USER_NAME, process.env.CBT_AUTHKEY);
        } else {
            result.error = true;
            result.message = 'Session Id was not defined';
        }

        result.error ? fulfill('Fail') : resolve('Pass'); //never call reject as we don't need this to actually stop the test
    });
};

processScripts();
