import { By, Key, until } from 'selenium-webdriver';
import fs from 'fs';
import request from 'request-promise';
import '@babel/polyfill';

import dotenv from 'dotenv';
dotenv.config();

import { uploadImage, getBlobUrl, takeUIPicture, fullPageScreenShot } from '../../azure/blobservice';
import { create_Happo_Report } from '../happo.js';

async function myUMLPopupTest_Selenium(capability, driver, gitHash) {
    return new Promise(async (resolve, reject) => {
        const url = 'https://stage.uml.edu/Student-Life/';
        try {
            await driver.get(url);
            let imagedata = await takeUIPicture(capability, driver, 'before click', gitHash, url);
            const button = await driver.findElement(By.xpath('//*[@id="form"]/header/div/div[2]/nav/ul/li[4]'));
            await button.click();
            await driver.executeScript('var item = document.getElementsByClassName("layout-header__quick-links")[0]; item.style.border = "solid 3px pink";');
            //imagedata = await takeUIPicture(capability, driver, 'after click', gitHash, url);
            await fullPageScreenShot(driver)
            resolve('complete');
        } catch (error) {
            reject(error);
        } finally {
            //await driver.showSnapshots()
            driver.quit();
        }
    });
}

async function solutionCenterWebsiteTest_Selenium(driver, hash) {
    //searching 'bill' display articles
    return new Promise(async (resolve, reject) => {
        try {
            await driver.get('https://www.uml.edu/help/thesolutioncenter/search&section=website');
            const searchField = await driver.findElement(
                By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[1]/div[3]/div/div/div[2]/div/div[1]/div[1]/span/label/div[2]/div/input')
            );
            await searchField.sendKeys('bill');
            await searchField.sendKeys(Key.ENTER);

            await driver.wait(
                until.elementLocated(By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[2]/div/div/div/div/div[1]/div/div/div[3]/div[1]/div[1]/a/span')),
                5000
            );

            //this could probably be one function
            const firstResult = await driver.findElement(
                By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[2]/div/div/div/div/div[1]/div/div/div[3]/div[1]/div[1]/a/span')
            );
            const session = await driver.getSession();
            await driver.takeSnapshot(session.id_);
            const text = await firstResult.getText();
            console.log(text);
            resolve(text);
        } catch (error) {
            console.error('solutionCenterWebsiteTest_Selenium CAUGHT ERROR TIMEOUT:', error);
            reject(error);
        } finally {
            //await driver.showSnapshots()
            driver.quit();
        }
    });
}

module.exports = {
    myUMLPopupTest_Selenium: myUMLPopupTest_Selenium,
    solutionCenterWebsiteTest_Selenium: solutionCenterWebsiteTest_Selenium,
};

// await driver.takeScreenshot().then( async (image, err) => {
//     const result = await fs.writeFile('screenshotimage.png', image, 'base64', function(err){
//         if(err){ throw err}
//     } );
// });
