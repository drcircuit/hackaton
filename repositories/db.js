module.exports = (uri) => {
    let client;
    let mongo = require("mongodb").MongoClient;

    function connectDb() {
        return mongo.connect(uri).then((c) => {
            const db = c.db("ethnics");
            let col = db.collection("accounts");
            return new Promise((resolve) => {
                client = c;
                resolve(col);
            });
        });
    }

    function clean() {
        if (client) {
            client.close();
        }
    }

    return {

        allAccounts: (bankId) => {
            return connectDb()
                .then((col) => {
                        return col.find({"bankAddress": bankId});
                    }
                )
                .then((res) => {
                    return res.toArray();
                });
        },
    }
}