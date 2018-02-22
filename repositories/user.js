// Simple mock up to get some user data out of a request

let id = require("./initialdata.js")

module.exports = () => {

    return {
        getUser: req => {
            return id.funders[1]
        }
    }
}