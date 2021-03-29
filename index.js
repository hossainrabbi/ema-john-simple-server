const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kiqx3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(cors());
app.use(bodyParser.json());

client.connect((err) => {
    const callaction = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_COLLECTION}`);

    const ordersCallaction = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_ORDER_COLLECTIONS}`);

    app.post('/addproduct', (req, res) => {
        const product = req.body;
        callaction.insertOne(product).then((result) => {
            console.log(result.insertedCount);
            res.send(result.insertedCount);
        });
    });

    app.get('/products', (req, res) => {
        callaction
            .find({})
            .limit(20)
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.get('/product/:key', (req, res) => {
        callaction
            .find({ key: req.params.key })
            .limit(20)
            .toArray((err, documents) => {
                res.send(documents[0]);
            });
    });

    app.post('/productByKeys', (req, res) => {
        const productsKeys = req.body;
        callaction
            .find({ key: { $in: productsKeys } })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.post('/addorder', (req, res) => {
        const order = req.body;
        ordersCallaction.insertOne(order).then((result) => {
            res.send(result.insertedCount > 0);
        });
    });

    err
        ? console.log('Database cunnected fail!')
        : console.log('Database cunnected success!');
});

app.listen(port, () => console.log(`App is listening on ${port}`));
