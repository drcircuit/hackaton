module.exports = (db) => {
    const express = require("express");
    const router = express.Router();
    
    router.get("/", (req, res) => {
        console.log("in here, showing all projects")
        db.listprojects().then(r => {
            res.json(r)
        })
    });

    return router
}