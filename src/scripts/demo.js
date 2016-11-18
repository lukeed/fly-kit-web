'use strict';

/**
 * Capitalize the String.
 * @param  {String} str
 * @return {String}
 */
exports.capitalize = function (str) {
	return (str && str.length) ? (str.charAt(0).toUpperCase() + str.slice(1)) : '';
};

/**
 * Return a random object
 * @return {Object}
 */
exports.generate = function () {
	return {
		hi: 'there',
		hello: 'world',
		howdy: 'partner'
	};
};
