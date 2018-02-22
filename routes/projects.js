var gen = require('random-seed'); // create a generator 
let rand = gen.create()
const mongoDb = require("mongodb")
const user = require("../repositories/user.js")()
const util = require("../repositories/util.js")


module.exports = (db, contracts) => {
    const express = require("express");
    const router = express.Router();
    
    // Function to take a db project object and use the web3 contracts interface
    // to fill with more information to use
    function fillProject(p) {
        let adr = p.contract;
        return contracts.getStatus(adr).then(r => {
            p.funded = util.toeth(r.raised)
            p.requested = util.toeth(r.goal)
            p.due_date = r.deadline
            p.due_date_collect = r.reclaimDeadline
            p.created = r.created
            return p})
            .then(p => {
            // Calculate the list of funders of this contract and add them:
            return contracts.getFunders(adr)
                .then(d => {
                    let flist = []
                    let alist = []
                    d.map(d => {
                        // each funder we need to figure out if it is anonymous or not
                        if(d.id != "") {
                            // We need to look this id up to see if we can match it against
                            // a saved id
                            flist.push(db.findFundMap("a"+d.id)
                                .then(fm => {
                                    if(fm) {
                                        let uid = fm.uid;
                                        // Get the user info so we have it all:
                                        return db.findFunder(uid).then(data => {
                                            if(data) {
                                                data.contribution = util.toeth(d.amount)
                                            }
                                            return data
                                        })
                                    } else {
                                        // The id was not known in the fund-map so this is a
                                        // anonymous contribution.
                                        alist.push({
                                            id:"anonymous",
                                            name:"Anonymous " + (alist.length +1),
                                            contribution: util.toeth(d.amount)
                                        })
                                        return null
                                    }
                                }))
                        } else {
                            // This is an anonymous one, add such:
                            alist.push({
                                id:"anonymous",
                                name:"Anonymous " + (alist.length +1),
                                contribution: util.toeth(d.amount)
                            })
                        }
                    })
                    // Wait for all the requests:
                    return Promise.all(flist).then(all => {
                        // Now build a list with all know and unknown backers,
                        // starting with the known backers
                        let list = []
                        all.map(d => {
                            if(d) {
                                list.push(d)
                            }
                        })
                        list = list.concat(alist)

                        console.log("in all", list)
                        p.funders = list
                        return p
                    }
                    )
                })

            // TODO: Implement status
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
                let mu = user.getUser(req)
                
                let mr = rand(1e10)
                db.createFundMap(pid, "a" + mr, mu.id).then(ra => {
                    res.json({"contract": r.contract,"tempid": mr})
                })
            }
        })

    });

    return router
}