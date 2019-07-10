import '@babel/polyfill';
import webdriver from 'selenium-webdriver';
import { SeleniumServer } from 'selenium-webdriver/remote';
import request from 'request';

import { myUMLPopupTest_Selenium, solutionCenterWebsiteTest_Selenium } from './selenium/index.js';
import selenium from './selenium/index.js';

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
        name: `${variations.windows10Edge.browserName} ${variations.windows10Edge.platform}`,
        build: '1.0',
        version: variations.windows10Edge.version,
        platform: variations.windows10Edge.platform,
        screen_resolution: '1366x768',
        record_video: 'true',
        record_network: 'false',
        browserName: variations.windows10Edge.browserName,
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

    solutionCenterWebsiteTest_Selenium(driver);
}

processScripts();
