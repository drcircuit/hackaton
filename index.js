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
/*contracts.createContract("0xd8761dB6E003DeD028B08FCEd4575C184197cCfA", "1000", "60", "60")
    .then(adr => {
        console.log("Created contract addr", adr)
    })*/
contracts.getFunders("0xd6E816b4EEe55e8C2eB7E3af5B60AaEf53AD256F")
    .then(a => {
        console.log("funders:", a)
    })

// Connect to mongoDb and do the inital set-up of adding dummy data to fill the database
console.log("connecting to mongodb://"+ip+":27017")
const db = require("./repositories/db.js")("mongodb://"+ip+":27017", contracts)
db.init()

// Register all the routes we want to use
app.use("/api/projects", require("./routes/projects.js")(db, contracts));
app.use("/api/doctors", require("./routes/doctors.js")(db, contracts));
app.use("/api/avatar", require("./routes/avatar.js")());

app.listen(port, () => console.log('Server listening on port ' +port +' !'))