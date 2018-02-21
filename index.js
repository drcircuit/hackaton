const express = require('express')
const app = express()

const Web3 = require("web3");


const ip = process.env.IP || "54.154.152.168";
const port = process.env.PORT || "8080";

const web3 = new Web3(new Web3.providers.HttpProvider("http://" + ip + ":8545"));

console.log("hej")

web3.eth.getBalance("0x889fA5dBf2052ff8244D0B9c092Ee50A4917c559")
    .then(console.log)
    .catch(console.error)



app.get('/', (req, res) => {
    console.log("server log")
    res.send('Hello World 2!')
})

app.listen(port, () => console.log('Example app listening on port ' +port +' !'))