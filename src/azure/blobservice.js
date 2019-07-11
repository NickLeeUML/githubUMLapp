import '@babel/polyfill';
const azure = require('azure-storage');
const { Aborter, BlobURL, BlockBlobURL, ContainerURL, ServiceURL, SharedKeyCredential, StorageURL, uploadStreamToBlockBlob } = require('@azure/storage-blob');
import sizeof from 'image-size';

import dotenv from 'dotenv';
dotenv.config();

const fs = require('fs');
const path = require('path');

import { createReport } from '../uitest/happo.js';

const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;

const ONE_MINUTE = 60 * 1000;

const blobService = azure.createBlobService(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY);

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

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

const uploadString = async (containerName, blobName, text) => {
    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromText(containerName, blobName, text, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Text "${text}" is written to blob storage` });
            }
        });
    });
};

export function getBlobUrl(containerName, blobName) {
    return blobService.getUrl(containerName, blobName);
}

export function takeUIPicture(driver, name) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await driver.takeScreenshot();
            const buff = new Buffer(data, 'base64');
            const size = sizeOf(buff);
            await uploadImage(name, buff);
            const url = await blobService.getUrl('screenshots', name);
            const imageObj = { url: url, variant: 'firefox', target: 'pc', component: 'wholepage', height: size.height, width: size.width };
            const imageArray = [imageObj];
            await createReport('def456', imageArray);
            resolve('done');
        } catch (err) {
            console.log('error in take ui picture: ', err);
            reject(err);
        }
    });
}
