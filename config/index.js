/**
 * Webpack Config
 *
 * @author matthias kallenbach
 * @date summer 2019
 */

/**
 * @type {string}
 */
let env = `${process.env.NODE_ENV || 'dev'}`;
if(!['dev','prod','shrink'].includes(env))
    env = 'dev';

console.log(`Building in ${env} mode`);

/**
 * ... add here some environments
 */
const configs = {
    dev : require('./development.js'),
    prod : require('./production.js'),
    shrink : require('./shrink.js'),
};

const configData = new configs[env]();
module.exports = configData;
