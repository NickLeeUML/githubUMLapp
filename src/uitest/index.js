import webdriver from 'selenium-webdriver';
import { SeleniumServer } from 'selenium-webdriver/remote';
import request from 'request';
import "@babel/polyfill";

import { myUMLPopup_Selenium, solutionCenterWebsite_Selenium} from './selenium/index.js'
import selenium from './selenium/index.js'

import dotenv from 'dotenv';
dotenv.config();

export default class UITest {
    constructor(url) {
        this.status = {
            running: false,
            error: false,
            errorMessage: ""
        }
        this.remoteHub = "http://hub.crossbrowsertesting.com:80/wd/hub'";
        this.browserConfigurations = {
            windows10Chrome : {
                'browserName': 'Chrome',
                'version': '75x64',
                'platform': 'Windows 10',
                'screenResolution': '1366x768'
            },
            windows10Firefox : {
                'browserName': 'Firefox',
                'version': '67x64',
                'platform': 'Windows 10',
                'screenResolution': '1366x768'
            },
            windows10Edge : {
                'browserName': 'MicrosoftEdge',
                'version': '18',
                'platform': 'Windows 10',
                'screenResolution': '1366x768'
            },
            osxSafari: {
                'browserName': 'Safari',
                'version': '12',
                'platform': 'Mac OSX 10.14',
                'screenResolution': '1366x768'
            },
            osxFirefox: {
                'browserName': 'Firefox',
                'version': '67',
                'platform': 'Mac OSX 10.14',
                'screenResolution': '1366x768'
            },
            osxChrome: {
                'browserName': 'Chrome',
                'version': '75x64',
                'platform': 'Mac OSX 10.14',
                'screenResolution': '1366x768'
            }

        };
        this.screenSizes = {
            small: {
                height: 900,
                width: 500
            },

            medium: {
                height: 900,
                width: 900,
            },

            large: {
                height: 1200,
                width: 500
            }
        }
    }

    start() {

    }
}

var scripts = [selenium.myUMLPopupTest_Selenium, selenium.solutionCenterWebsiteTest_Selenium]


function methodThatReturnsAPromise(seleniumFunction,driver) {
    return new Promise(async (resolve,reject)=>{
        let value = await seleniumFunction(driver);
        console.log('method that returns value: ', value)
        resolve(value)
  })
}
  
function processScripts(){
    
    scripts.reduce( async (accum, func) =>{
        await accum;

        const caps = {
            name : 'July 8',   // Name for Crossbrowser test
            build :  '1.0',
            version : '75x64', 
            platform : 'Mac OSX 10.14', 
            screen_resolution : '1366x768',
            record_video : 'true',
            record_network : 'false',
            browserName : 'Chrome',
            username : process.env.CBT_USER_NAME,
            password : process.env.CBT_AUTHKEY
        };
    
        const driver = new webdriver.Builder()
            .usingServer("http://hub.crossbrowsertesting.com:80/wd/hub")
            .withCapabilities(caps)
            .build()
            driver.manage().window().setRect({width: 1200, height: 600})

        return methodThatReturnsAPromise(func,driver)
    }, Promise.resolve())

}

  //processScripts()




webdriver.WebDriver.prototype.takeSnapshot = function() {

    return new Promise((resolve, fulfill)=> { 
        var result = { error: false, message: null }
        
        if (sessionId){
            request.post(
                'https://crossbrowsertesting.com/api/v3/selenium/' + sessionId + '/snapshots', 
                function(error, response, body) {
                    if (error) {
                        result.error = true;
                        result.message = error;
                    }
                    else if (response.statusCode !== 200){
                        result.error = true;
                        result.message = body;
                    }
                    else{
                        result.error = false;
                        result.message = 'success';
                    }
                }
            )
            .auth(username,authkey);   
        }
        else{
            result.error = true;
            result.message = 'Session Id was not defined';
        }
        result.error ? fulfill('Fail') : resolve('Pass'); //never call reject as we don't need this to actually stop the test
    });
}
