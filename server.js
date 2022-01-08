/**
 * Server.
 * 
 * 1. Connect to database
 * 2. Set API headers
 * 3. Set API routes
 * 4. Listen to port and start server
 * 
 * @author: Sofie Wallin
 */

// dotenv - for enabling use of .env
require('dotenv').config();

// Express
const express = require('express');
const app = express();
app.use(express.json());

// Mongoose
const mongoose = require('mongoose');

/**
 * 1. Connect to database
 */

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

/**
 * 2. Set API headers
 */

app.all('/api/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
	next();
});

/**
 * 3. Set API routes
 */

// Middleware to authenticate user for route
const authenticateUser = require('./middleware/authenticateUser');

// Routes for authentication
const  authenticationRouter = require('./routes/authentication');
app.use('/', authenticationRouter);

// Routes for series
const seriesRouter = require('./routes/series');
app.use('/series', authenticateUser, seriesRouter);

// Routes for users
const usersRouter = require('./routes/users');
app.use('/users/', authenticateUser, usersRouter);


/**
 * 4. Listen to port and start server
 */

const port = process.env.PORT || 3000; 
app.listen(port, () => console.log(`Server started. Listening on port ${port}...`));
