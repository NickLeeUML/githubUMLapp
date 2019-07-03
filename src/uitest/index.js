import webdriver from 'selenium-webdriver';
import { SeleniumServer } from 'selenium-webdriver/remote';
import request from 'request';

import { myUMLPopup_Selenium, solutionCenterWebsite_Selenium} from './selenium/index.js'

export default class UITest {
    constructor(url) {
        this.remoteHub = "http://hub.crossbrowsertesting.com:80/wd/hub'";
    }

    start() {

        const tasks = [myUMLPopup_Selenium, solutionCenterWebsite_Selenium];

        tasks.reduce((results, currentFunc)=>{
            await currentFunc()
        }, )


    }
}

