var gen = require('random-seed'); // create a generator 
let rand = gen.create()
const mongoDb = require("mongodb")


module.exports = (db, contracts) => {
    const express = require("express");
    const router = express.Router();
    
    // Function to take a db project object and use the web3 contracts interface
    // to fill with more information to use
    function fillProject(p) {
        let adr = p.contract;
        console.log("adr", adr, p)
        return contracts.getStatus(adr).then(r => {
            p.funded = r.raised
            p.requested = r.goal
            p.due_date = r.deadline
            p.due_date_collect = r.reclaimDeadline
            p.created = r.created

            // TODO: Implement status
            return p
        })
    }


    // Return general info about all the projects
    router.get("/", (req, res) => {
        db.listprojects().then(r => {
            // Map over some fields to rename and remove as expected
            r = r.map(it => {
                it.id = it._id
                delete it._id
                delete it.interested
                delete it.description
                return fillProject(it)
            })
            Promise.all(r).then(a => {
                console.log("aaa", a)
                res.json(a)
            })
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
                fillProject(r)
                    .then(a => {
                        res.json(a)
                    })
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
                db.createFundMap(pid, mr).then(ra => {
                    res.json({"contract": r.contract,"tempid": mr})
                })
            }
        })

    });

    return router
}