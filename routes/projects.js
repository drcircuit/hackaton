var gen = require('random-seed'); // create a generator 
let rand = gen.create()
const mongoDb = require("mongodb")


module.exports = (db, contracts) => {
    const express = require("express");
    const router = express.Router();
    
    // Function to take a db project object and use the web3 contracts interface
    // to fill with more information to use
    


    // Return general info about all the projects
    router.get("/", (req, res) => {
        db.listprojects().then(r => {
            // Map over some fields
            r = r.map(it => {
                it.id = it._id
                delete it._id
                delete it.interested
                delete it.description
                return it
            })
            // We also need to read out the data 
            res.json(r)
        })
    });

    // Return detailed info about a particular project
    router.get("/:id", (req, res) => {
        let pid = req.params.id
        db.getproject(pid).then(r => {
            if(!r) {
                res.status(404);
                res.send({error: "No such project"});
            } else {
                res.json(r)
            }
        })

    });

    // Create an id mapping for using with the contract creation
    router.get("/:id/fund", (req, res) => {
        let pid = req.params.id
        db.getproject(pid).then(r => {
            if(!r) {
                res.status(404);
                res.send({error: "No such project"});
            } else {
                // Create a "random" (this is not very safe) id that you can use for funding
                let mr = "a" + rand(1e14)
                console.log(r)
                db.createFundMap(pid, mr).then(ra => {
                    res.json({"contract": r.contract,"tempid": mr})
                })
            }
        })

    });

    return router
}