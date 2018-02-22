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
cc(0,"0xC5089384BdB7360f1b7B5A89990786dC4B38a8C7", big(1e18).multiply(5)+"", 60*24*3, 60*24*10)
cc(1,"0xd0902F13853b15456D5DdCaCb23Ee7eB1b707771", big(1e18).multiply(2)+"", 60*24*7, 60*24*10)
cc(2,"0x9eB372dc25022589B8b0a6c9d31C7be0f5E2eC9A", big(1e18).multiply(19)+"", 60*24*11, 60*24*10)
cc(3,"0x30F69d26d219aa01a3cd515E442C692fF0e8CeED", big(1e18).multiply(50)+"", 60*24*9, 60*24*5)
// Returned values
Created contract addr 0 0x380EF39e9467f8d09471A5a11e8da1D7337F6f26
Created contract addr 1 0xE39b60a11dBf7CA072572eFf91292061A3CA983f
Created contract addr 2 0x439cc045E15219668479836FF6673C7b618b888A
Created contract addr 3 0x07031fC188D25Da59f3F7c288812B557fb135A36
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