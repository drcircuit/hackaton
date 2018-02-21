module.exports = (bankid, cnok, storage) => {
    const express = require("express");
    const router = express.Router();
    
    router.get("/", (req, res) => {
        console.log("in here")
        res.json({address: "cnok.getContract()}"})
    });

    return router
}