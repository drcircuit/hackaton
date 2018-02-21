var gen = require('random-seed'); // create a generator 
let rand = gen.create()
const mongoDb = require("mongodb")


module.exports = (db, contracts) => {
    const express = require("express");
    const router = express.Router();
    
    // Function to take a db project object and use the web3 contracts interface
    // to fill with more information to use
    }


    // Return general info about all the projects
    router.get("/", (req, res) => {
        db.getdoctors().then(r => {
            // Map over some fields to rename and remove as expected
            r = r.map(it => {
                it.id = it._id
                delete it._id
                return
            })

        })
    });

    // Return detailed info about a particular project
    router.get("/:id", (req, res) => {
        let pid = req.params.id
        db.getdoctor(pid).then(r => {
            if(!r) {
                res.status(404);
                res.send({error: "No such project"});
            } else {
                res.json(r)
            }
        })

    });
    return router
}