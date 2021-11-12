const express = require("express");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrh7n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('connected to database');

        const database = client.db('glamstar');
        const productsCollection = database.collection('products');
        const bookingConfirmations = database.collection('bookingConfirmations');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');


        //POST Products API

        app.post('/products', async (req, res) => {

            const product = req.body;
            console.log('hit the post', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result)
        })
        // GET Full API

        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })
        //POST Bookings API
        app.post('/bookingConfirmations', async (req, res) => {

            const package = req.body;
            console.log('hit the post', package);
            const result = await bookingConfirmations.insertOne(package);
            console.log(result);
            res.json(result)
        })
        app.get('/bookingConfirmations', async (req, res) => {
            const cursor = bookingConfirmations.find({});
            const packages2 = await cursor.toArray();
            res.send(packages2)
        })

        //POST USERs API

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //POST Reviews API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // Get Single API
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific ID', id);
            const query = { _id: ObjectID(id) };
            const package = await productsCollection.findOne(query);
            res.json(package);
        })

        //Get Users Email Info with upsert so no double email address


        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });




        //Make Admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        //Check Admin Status

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })



        // //Delete API

        app.delete('/bookingConfirmations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await bookingConfirmations.deleteOne(query);
            res.json(result);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        //Get confirmation single API

        app.put('/bookingConfirmations/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            console.log('getting specific ID', id);
            const filter = { _id: ObjectID(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                },
            };

            const result = await bookingConfirmations.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        //Get hotels API

        // app.post('/packages2', async (req, res) => {

        //     const hotelPackage = req.body;
        //     console.log('hit the post', hotelPackage);
        //     const result = await hotelsCollections.insertOne(hotelPackage);
        //     console.log(result);
        //     res.json(result)
        // })

        // app.get('/packages2', async (req, res) => {
        //     const cursor = hotelsCollections.find({});
        //     const packages2 = await cursor.toArray();
        //     res.send(packages2)
        // })


    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir)



app.get('/', async (req, res) => {
    res.send('Glamstart server running');
})

app.listen(port, () => {
    console.log("Glamstart is Running on", port);
})