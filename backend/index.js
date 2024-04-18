const express = require("express");
const cors = require("cors")
const dotenv = require('dotenv')
dotenv.config()
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors())
app.use(express.json())
const uri = (process.env.Mongo_url);
const options = { useNewUrlParser: true, useUnifiedTopology: true };

app.get("/", (req, res) => {
    res.end("hello");
});

MongoClient.connect(uri, options)
    .then(client => {
        const db = client.db('mydatabase');
        const collection = db.collection('orders');

        app.get("/getorders", (req, res) => {
            collection.find().toArray() // Convert cursor to array
                .then(orders => {
                    res.json(orders)

                })

                .catch(error => res.status(500).json({ error: error.message }));
        });
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    });

app.listen(3300, () => {
    console.log("Server is running on port 3300");
});
