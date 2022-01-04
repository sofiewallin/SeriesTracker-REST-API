/**
 * Server file.
 * 
 * @author: Sofie Wallin
 */

const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

app.use(express.json());

/* 1. Connect to database */

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

/* 2. Set API headers */

app.all('/api/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	next();
});

/* 3. Set API routes */

// Users routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// Series routes
const seriesRouter = require('./routes/series');
app.use('/api/series', seriesRouter);


/* 4. Listen to port and start server */
const port = process.env.PORT || 3000; 

app.listen(port, () => console.log(`Server started. Listening on port ${port}...`));
