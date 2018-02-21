const data = require("./initialdata.js")
const mongodb = require("mongodb")

module.exports = (uri, contracts) => {
    let client;
    let mongo = require("mongodb").MongoClient;

    function connectDb() {
        return mongo.connect(uri).then((c) => {
            return new Promise(r => {
                r(c.db("hackaton"))
            })
        });
    }

    connectDb().then(() => {
        console.log("conntected to db")
    })

    return {
        init: (bankId) => {
            return connectDb()
                .then(db => {
                        // Start by dropping all the collections so we always start from something well
                        // defined.
                        db.collection("projects").drop()
                        db.collection("doctors").drop()
                        db.collection("funders").drop()

                        let all = []
                        // Fill with the projects
                        let col = db.collection("projects")
                        data.projects.map((d,i) => {
                            console.log("creating project " + i)
                            all.push(col.update({_id: d._id}, d, {upsert: true}))
                        })
                        // Fill with doctors
                        col = db.collection("doctors")
                        data.doctors.map((d,i) => {
                            console.log("creating doctor " + i)
                            all.push(col.update({_id: d._id}, d, {upsert: true}))
                        })
                        // Fill with funders
                        col = db.collection("funders")
                        data.doctors.map((d,i) => {
                            console.log("creating funder " + i)
                            all.push(col.update({_id: d._id}, d, {upsert: true}))
                        })
                        return Promise.all(all)
                    }
                )
        },
        listprojects: () => {
            return connectDb()
                .then(db => {
                    return db.collection("projects").find().toArray()
                })
        },
        getproject: (id) => {
            return connectDb()
                .then(db => {
                    return db.collection("projects").findOne({"_id":id})
                })
        },
        createFundMap: (pid, no) => {
            return connectDb()
                .then(db => {
                    return db.collection("fundmaps").insert({
                        _id:new mongodb.ObjectID(),
                        pid: pid,
                        no: no,
                    })
                })
        },
    getdoctors: () => {
            return connectDb()
                .then(db => {
                    return db.collection("doctors").find();
            });
    },
    getdoctor: (id) => {
            return connectDb()
                .then(db => {
                    return db.collection("doctors").findOne({"_id": id});
            });
    }
    }
}