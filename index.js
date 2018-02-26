// Generic imports
const big = require("big-number")

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
web3.eth.getBalance("0x8814894d7b0b4269b4f082a265fdddb841b4f265")
    .then(console.log)
const contracts = require("./repositories/contract.js")(web3, "0x8814894d7b0b4269b4f082a265fdddb841b4f265")

//Commented out section to create contracts
/*
let cc = (i, a, b, c, d) => {
    console.log(i, 1, b, c, d)
    contracts.createContract(a, b, c, d)
        .then(adr => {
            console.log("Created contract addr", i, adr)
        })
}
cc(0,"0xC5089384BdB7360f1b7B5A89990786dC4B38a8C7", big(1e18).multiply(5)+"", 60*24*300, 60*24*10)
cc(1,"0xd0902F13853b15456D5DdCaCb23Ee7eB1b707771", big(1e18).multiply(2)+"", 60*24*700, 60*24*10)
cc(2,"0x9eB372dc25022589B8b0a6c9d31C7be0f5E2eC9A", big(1e18).multiply(19)+"", 60*24*110, 60*24*10)
cc(3,"0x30F69d26d219aa01a3cd515E442C692fF0e8CeED", big(1e18).multiply(50)+"", 60*24*900, 60*24*5)
Created contract addr 0 0xaeFE58156872E20B13A24FAEb2c388285611F56E
Created contract addr 1 0xba76851907F166D104196A3C2fB5099Dd33bb22E
Created contract addr 3 0x644e42312ffE4AA5C8f574d1227dcB301fC1Cca9
Created contract addr 2 0x96575e33B664F7ce498f9A9855a51ca333816056

*/

// Connect to mongoDb and do the inital set-up of adding dummy data to fill the database
console.log("connecting to mongodb://"+ip+":27017")
const db = require("./repositories/db.js")("mongodb://"+ip+":27017", contracts)
db.init()

// Register all the routes we want to use
app.use("/api/projects", require("./routes/projects.js")(db, contracts));
app.use("/api/doctors", require("./routes/doctors.js")(db, contracts));
app.use("/api/avatar", require("./routes/avatar.js")());

app.listen(port, () => console.log('Server listening on port ' +port +' !'))