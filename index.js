const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


//middle war

app.use(cors());
app.use(express.json());

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.icikx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// main 

async function run() {
    try {
        await client.connect();
        const database = client.db("tour_info");
        const servicesCollection = database.collection("services");
        const orderCollection = database.collection("order");
        // query for movies that have a runtime less than 15 minutes
        // get all service 
        app.get('/services', async (req, res) => {
            const cursor = await servicesCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        // get single service 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query);
            res.json(result);
        })
        //add service 
        app.post('/addService', async (req, res) => {
            const data = req.body;
            const result = servicesCollection.insertOne(data);
            console.log(result);
            console.log(req.body);
            res.send(result);
        })
        //add order 
        app.post('/order', async (req, res) => {
            const data = req.body;
            const result = await orderCollection.insertOne(data);
            console.log(req.body);
            res.send('done')
        })
        //update 
        app.put('/allOrders/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateStatus = req.body;
            const options = { upsert: true };
            console.log(req.body);
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //find all orders
        app.get('/allOrders', async (req, res) => {
            const cursor = await orderCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        //delete orders
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })
        // get user order
        app.get('/myorders', async (req, res) => {
            const user = req.query.user;
            const query = { email: { $regex: user } };
            const cursor = await orderCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })
        //delete my order
        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





// default 
app.get('/', async (req, res) => {
    res.send('Hash Tour server is running ');
})
app.listen(port, () => {
    console.log('server is running at port', port);
})