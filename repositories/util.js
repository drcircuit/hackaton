
const BigNumber = require('bignumber.js');

module.exports = {
    // Convert from wei string to float in ether for front end
    toeth: bn => BigNumber(bn).toNumber()/1e18
}