import test from './test';
import test2 from './test2';
import {isOk, onSuccess, onError} from './sw';

// Run the service worker if we determine it's safe to
// Note: this will Error during development because
// 'service-worker.js' only exists after production builds.
if (isOk) {
	navigator.serviceWorker.register('service-worker.js').then(onSuccess).catch(onError);
}

// Custom JS goes here!
const name = 'Johnny';
console.log(`Heeeeere's ${name}!!`);

console.log(test);
console.log(test2);
