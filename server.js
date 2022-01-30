/**
 * Server.
 * 
 * 1. Connect to database
 * 2. Set API routes
 * 3. Listen to port and start server
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

// Cors 
const cors = require('cors');

app.use(cors());

/**
 * 1. Connect to database
 */

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

/**
 * 2. Set API routes
 */

// Middleware to authenticate user for route
const verifyToken = require('./middleware/verifyToken');

// Routes for authentication
const  authenticationRouter = require('./routes/authentication');
app.use('/', authenticationRouter);

// Routes for series
const seriesRouter = require('./routes/series');
app.use('/series', verifyToken, seriesRouter);

// Routes for users
const usersRouter = require('./routes/users');
app.use('/users/', verifyToken, usersRouter);


/**
 * 3. Listen to port and start server
 */

const port = process.env.PORT || 3000; 
app.listen(port, () => console.log(`Server started. Listening on port ${port}...`));
