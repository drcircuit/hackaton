// Configs from the environment
const ip = process.env.IP || "54.154.152.168";
const port = process.env.PORT || "8080";

// Create and config a simple web server, for now accept everything
const express = require('express')
const bp = require("body-parser");
const app = express()
app.use(bp.json());
app.use(bp.urlencoded({extended: false}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
app.use(express.static('public'))

// Create and test the web3 client we will be using
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://" + ip + ":8545"));
web3.eth.getBalance("0x889fA5dBf2052ff8244D0B9c092Ee50A4917c559")
    .then(console.log)
    .catch(console.error)

// Connect to mongoDb and do the inital set-up of adding dummy data to fill the database
console.log("connecting to mongodb://"+ip+":27017")
const db = require("./repositories/db.js")("mongodb://"+ip+":27017")
db.init()

// Register all the routes we want to use
app.use("/api/projects", require("./routes/projects.js")(db));

app.listen(port, () => console.log('Server listening on port ' +port +' !'))