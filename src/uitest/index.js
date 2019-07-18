import '@babel/polyfill';
import webdriver from 'selenium-webdriver';
import { SeleniumServer } from 'selenium-webdriver/remote';
import request from 'request';

import { myUMLPopupTest_Selenium, solutionCenterWebsiteTest_Selenium } from './selenium/index.js';

import dotenv from 'dotenv';
dotenv.config();

const selenium_scripts = [myUMLPopupTest_Selenium];

export default class UITest {
    constructor(hash) {
        this.hash = hash;
        this.status = {
            running: false,
            error: false,
            errorMessage: '',
        };
        this.remoteHub = "http://hub.crossbrowsertesting.com:80/wd/hub'";
        this.browserConfigurations = {
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
            windows10Edge: {  // erroring out 
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
        this.screenSizes = {
            small: {
                height: 900,
                width: 500,
            },

            medium: {
                height: 900,
                width: 900,
            },

            large: {
                height: 1200,
                width: 500,
            },
        };
    }

    start() {
        this.status.running = true;
        const browserConfigurationsArray = Object.values(this.browserConfigurations);

        let results = browserConfigurationsArray.reduce(async (accum, current) => {
            //current is data for pass to functio
            await accum;

            return processScripts(current, this.hash);
        }, Promise.resolve());

        results.then((e) => {
            console.log('all done');
            this.status.running = false;
        });
    }

    changeStatus = (running, error, message) => {
        this.status = {
            running,
            error,
            message,
        };
    };
}

function methodThatReturnsAPromise(seleniumFunction, driver, capability, hash) {
    return new Promise(async (resolve, reject) => {
        let value = await seleniumFunction(capability, driver, hash).catch((e) => {
            console.log('returned promise error :', e);
            reject(e);
        });
        console.log('method that returns value: ', value);
        resolve(value);
    });
}

function processScripts(capability, hash) {
    return new Promise((resolve, reject) => {
        let result = selenium_scripts.reduce(async (accum, func) => {
            await accum;

            const caps = {
                name: `${capability.browserName} ${capability.platform} ${func.name}`, // Name for Crossbrowser test
                build: '1.0',
                version: capability.version,
                platform: capability.platform,
                screen_resolution: '1366x768',
                record_video: 'true',
                record_network: 'false',
                browserName: capability.browserName,
                username: process.env.CBT_USER_NAME,
                password: process.env.CBT_AUTHKEY,
            };

            const driver = new webdriver.Builder()
                .usingServer('http://hub.crossbrowsertesting.com:80/wd/hub')
                .withCapabilities(caps)
                .build();
            await driver
                .manage()
                .window()
                .setRect({ width: 1200, height: 600 });

            return methodThatReturnsAPromise(func, driver, capability, hash).catch((e) => {
                console.error(e);
            });
        }, Promise.resolve());

        result.then(
            (value) => {
                resolve(value);
            },
            (reason) => {
                reject(reason);
            }
        );
    });
}

const test = new UITest( );
test.start();
