import SmeeClient from 'smee-client';
import '@babel/polyfill';

const smee = new SmeeClient({
    source: 'https://smee.io/8iAQKn4djxswAvb2',
    target: 'http://localhost:3000/events',
    logger: console,
});

const events = smee.start();
