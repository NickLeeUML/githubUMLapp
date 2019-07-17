import '@babel/polyfill';
const azure = require('azure-storage');
const { Aborter, BlobURL, BlockBlobURL, ContainerURL, ServiceURL, SharedKeyCredential, StorageURL, uploadStreamToBlockBlob } = require('@azure/storage-blob');
import sizeOf from 'image-size';
import md5 from 'md5';

import dotenv from 'dotenv';
dotenv.config();

const fs = require('fs');
const path = require('path');

import { create_Happo_Report } from '../uitest/happo.js';

const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;

const ONE_MINUTE = 60 * 1000;

const blobService = azure.createBlobService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}
/*
    uploadImage(blobName, data)
    
    blobName: String(), 'SHA-1/Windows10/MicrosoftEdge18/uml.edu.studentlife/beforelick.png' 
    data: base 64 buffer

*/

export async function uploadImage(blobName, data) {
    return new Promise((resolve, reject) => {
        const containerName = 'screenshots';
        blobService.createBlockBlobFromText(containerName, blobName, data, { contentSettings: { contentType: 'image/jpg' } }, function(
            error,
            result,
            response
        ) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log(result);
                resolve(result);
            }
        });
    });
}

export function getBlobUrl(containerName, blobName) {
    return blobService.getUrl(containerName, blobName);
}

export function takeUIPictureSendReport(driver, name) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await driver.takeScreenshot();
            const buff = new Buffer(data, 'base64');
            const size = sizeOf(buff);
            await uploadImage(name, buff);
            const url = await blobService.getUrl('screenshots', name);
            const imageObj = { url: url, variant: 'firefox', target: 'pc', component: 'wholepage', height: size.height, width: size.width };
            const imageArray = [imageObj];
            await create_Happo_Report('def456', imageArray);
            resolve('done');
        } catch (err) {
            console.log('error in take ui picture: ', err);
            reject(err);
        }
    });
}

export function takeUIPicture(driver, name) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await driver.takeScreenshot();
            const buff = new Buffer(data, 'base64');
            const size = sizeOf(buff);
            const imageHash = md5(buff)
            const exsits = await checkIfImageExists(imageHash)
            if(exists) { //return url address
              const url = await blobService.getUrl('screenshots', imageHash);
              const imageObj = { url: url, variant: 'firefox', target: 'pc', component: `wholepage${name}`, height: size.height, width: size.width };
              resolve(imageObj);

            } else {  // upload new image, return url
                await uploadImage(imageHash, buff);
                const url = await blobService.getUrl('screenshots', imageHash);
                const imageObj = { url: url, variant: 'firefox', target: 'pc', component: `wholepage${name}`, height: size.height, width: size.width };
                resolve(imageObj);
            }
            
        } catch (err) {
            reject(err);
        }
    });
}

function checkIfUnique(buffer) { // data = buffer
    const url = md5(buffer)
    //const url = await blobService.getUrl('screenshots', name);
}

export function checkIfImageExists(url) {
    return new Promise((resolve, reject) => {
        // const buffer = new Buffer(bitmap).toString('base64');
        // const url = md5(buffer);
        blobService.doesBlobExist('screenshots', url, function (error, result) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(result.exists)
            }
        })
    })
}

export function checkIfImageExistsLocal() {
    return new Promise((resolve, reject) => {
        const bitmap = fs.readFileSync(path.join(__dirname + '../../../src/azure/testimage.png'));
        const buffer = new Buffer(bitmap).toString('base64');
        const url = md5(buffer);
        blobService.doesBlobExist('screenshots', url, function (error, result) {
            if (error) {
                console.log(error)
                reject(error)
            } else {
                resolve(result.exists)
            }
        })
    })
}
