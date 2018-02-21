const express = require('express')
const app = express()

app.get('/', (req, res) => {
    console.log("server log")
    res.send('Hello World 2!')
})

app.listen(80, () => console.log('Example app listening on port 80!'))