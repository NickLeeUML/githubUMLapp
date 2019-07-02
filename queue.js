const azure = require("azure-storage");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const queueSvc = azure.createQueueService();

queueSvc.messageEncoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder();

queueSvc.createMessage('teststatus', "Boston!", function(error, results, response){
    if(!error){
      console.log("message inserted")
    } else {
        console.log(error)
    }
  });