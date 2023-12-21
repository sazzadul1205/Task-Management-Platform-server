const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// Middle Ware
app.use(cors({
    origin: [
        'http://localhost:5173',
    ],
    credentials: true
}))

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@users.wtosrtx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        // Collections
        const userCollection = client.db('TaskManagement').collection('Users');
        const taskCollection = client.db('TaskManagement').collection('tasks');

        // user API
        // view all users
        app.get('/users', async (req, res) => {
            const { email } = req.query;
            // If email is provided, check if the user exists
            if (email) {
                const query = { email };
                const result = await userCollection.findOne(query);
                res.send({ exists: result !== null, user: result });
            } else {
                // If email is not provided, find all users
                const result = await userCollection.find().toArray();
                res.send(result);
            }
        });
        // Post users
        app.post('/users', async (req, res) => {
            const request = req.body;
            const result = await userCollection.insertOne(request);
            res.send(result)
        });
        // delete users
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        });

        // task API
        // view all tasks
        app.get('/tasks', async (req, res) => {
            const { email } = req.query;
            // If email is provided, check if the user exists
            if (email) {
                const query = { email };
                const result = await taskCollection.find(query).toArray();
                res.send(result);
            } else {
                // If email is not provided, find all users
                const result = await taskCollection.find().toArray();
                res.send(result);
            }
        });
        // view a task
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query)
            res.send(result)
        });
        // Post a task
        app.post('/tasks', async (req, res) => {
            const request = req.body;
            const result = await taskCollection.insertOne(request);
            res.send(result)
        });
        // patch a task (update task state)
        app.patch('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const newState = req.body.state;

            console.log('Received request to update task state. ID:', id, 'New State:', newState, 'Request Body:', req.body);

            if (!newState || !['To-Do', 'Ongoing', 'Completed'].includes(newState)) {
                return res.status(400).send({ error: 'Invalid state provided' });
            }

            const query = { _id: new ObjectId(id) };
            const update = { $set: { state: newState } };

            try {
                const result = await taskCollection.updateOne(query, update);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // delete trainerReq
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Task Manager is Running')
})
app.listen(port, () => {
    console.log(`Task Manager Server is Running On Port ${port}`);
})

