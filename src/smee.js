const SmeeClient = require('smee-client');

const smee = new SmeeClient({
    source: 'https://smee.io/8iAQKn4djxswAvb2',
    target: 'http://localhost:3000/events',
    logger: console,
});

const events = smee.start();
