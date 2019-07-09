import { By, Key, until } from "selenium-webdriver"
import fs from 'fs'
import "@babel/polyfill";

 async function myUMLPopupTest_Selenium(driver){
    return new Promise(async (resolve,reject) => {
        try {
            await driver.get("https://stage.uml.edu/Student-Life/")
        
            const button = await driver.findElement(By.xpath('//*[@id="form"]/header/div/div[2]/nav/ul/li[4]'))
            console.log('button:', button)
            await button.click();
            await driver.takeScreenshot().then( async (image, err) => {
                const result = await fs.writeFile('!myUMLPopup.png', image, 'base64', function(err){
                    if(err){ throw err}
                } );            
            });
            const link = await driver.findElement(By.xpath('//*[@id="form"]/div[3]/div[4]/div/div/div/h1'))
            const text = await link.getText()
            //potentially want to click on links to navigate to new page
            resolve(text)
        } catch(error){
            reject(error)
        } finally {
            //await driver.showSnapshots()
            driver.quit()
        }
    })
}


 async function solutionCenterWebsiteTest_Selenium(driver){
    //searching 'bill' display articles
    return new Promise( async (resolve, reject)=>{

        try {
            await driver.get("https://stage.uml.edu/help/thesolutioncenter/?query=&section=website")
            const searchField = await driver.findElement(By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[1]/div[3]/div/div/div[2]/div/div[1]/div[1]/span/label/div[2]/div/input'))
            await searchField.sendKeys('bill')
            await searchField.sendKeys(Key.ENTER)

            await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[2]/div/div/div/div/div[1]/div/div/div[3]/div[1]/div[1]/a/span')),5000)
            
            //this could probably be one function 
            const firstResult = await driver.findElement(By.xpath('/html/body/div[1]/uml-app-knowledge-base/div[2]/div/div/div/div/div[1]/div/div/div[3]/div[1]/div[1]/a/span'))
            const text = await firstResult.getText()
            console.log("from selenium func", text)

            resolve(text)
        } catch(error){
            console.error(error)
            reject(error)
        } finally {
            //await driver.showSnapshots()
            driver.quit()
        }

    })
}



module.exports = {
    myUMLPopupTest_Selenium:myUMLPopupTest_Selenium,
    solutionCenterWebsiteTest_Selenium: solutionCenterWebsiteTest_Selenium
}