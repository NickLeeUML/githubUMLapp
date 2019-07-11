import '@babel/polyfill';
import request from 'request-promise';
import dotenv from 'dotenv';
dotenv.config();

const HAPPO_API_KEY = process.env.HAPPO_API_KEY;
const HAPPO_API_SECRET = process.env.HAPPO_API_SECRET;

const token = new Buffer(`${HAPPO_API_KEY}:${HAPPO_API_SECRET}`).toString('base64');

export const getReportStatus = async function(reportId = 'dev-35e526eca7fa4803d70f') {
    const options = {
        url: `https://happo.io/api/reports/${reportId}/status`,
        headers: {
            Authorization: `Basic ${token}`,
        },
    };
    request.get(options).then(console.log);
}; 

export const createReport = async function(sha, imageURLSArray) {
    //where :sha is unique id usually commit

    let body = {
        snaps: imageURLSArray,
        message: 'first image upload',
    };

    return new Promise((resolve, reject) => {
        const options = {
            url: `https://happo.io/api/reports/${sha}`,
            headers: {
                Authorization: `Basic ${token}`,
            },
            body: body,
            json: true
        };
        request
            .post(options)
            .then((data) => {
                //handle error
                resolve(data);
            })
            .catch((error) => {
                reject(error);
            });
    });
};
