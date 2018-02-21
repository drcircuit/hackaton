
module.exports = () => {
    const express = require("express");
    const router = express.Router();

    // Return detailed info about a particular project
    router.get("/:id", (req, res) => {
        let pid = req.params.id
        res.send("")
    })
    return router

}