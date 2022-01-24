# Series Tracker REST API

This is a REST API for an application called Series Tracker. I have developed the API and the application as part of a school project. The purpose of the project is to learn how to create a REST API using Node.js, Express and MongoDB and then consume the API in a web application using a JavaScript framework.

Series Tracker allows a user to track all the series they are watching, that they want to watch or that they have already watched. When the user adds series they can choose to add it as "Watching now", "Watch next" or "Have watched" and the user can also mark which episodes they have watched and get an overview of which episodes to watch next. At this point there is no registering function for the application and it runs on only one user.

## The REST API

The REST API was developed using Node.js, Express and MongoDB. The API is built in two parts: one for administrating series and one for handling user actions in the application. At this point the application only has one user but if the application would have more users, the administration of series would be authorized to a user with the role admin.

Routes has been protected using login and JWT. It has three routes with multiple endpoints: One for administrating series (`/series`), one for handling user actions (`/users`) and one for authentication (`/`). Both the series routes and the user routes are protected.

### Endpoints

These are all the endpoints for the different routes:

**Authentication** (`routes/authentication.js`)

- POST / Login user: `./login`

**Series** (`routes/series.js`)

- POST / Create one series: `./series`
- GET / Get all series: `./series`
- GET / Search all series by name: `./series/search/:query`
- GET / Get one series: `./series/:id`
- GET / Get one episode: `./series/:id/get-episode/:episode_id`
- PATCH / Update one series: `./series/:id`
- PATCH / Add one episode: `./series/:id/add-episode`
- PATCH / Update one episode: `./series/:id/update-episode/:episode_id`
- PATCH / Remove one episode: `./series/:id/remove-episode/:episode_id`
- DELETE / Delete one series: `./series/:id`

**Users** (`routes/users.js`)

- GET / Get all added series to a user: `./users/:id/series`
- PATCH / Add series to a user: `./users/:id/add-series`
- PATCH / Remove series from a user: `./users/:id/remove-series/:series_id`
- PATCH / Add episode to "watched episodes" and set next episode for one series added to a user: `./users/:id/series/:series_id/watch-episode/:episode_id`
- PATCH / Remove episode from "watched episodes" and set next episode for one series added to a user: `./users/:id/series/:series_id/unwatch-episode/:episode_id`
- PATCH / Clear watch history and set next episode to first episode of one series added to a user: `./users/:id/series/:series_id/clear-watch-history`
- PATCH / Change watching status of one series added to a user: `./users/:id/series/:series_id/change-watching-status/:status`

### Packages

The following packages has been added as dependencies:

- [`dotenv`](https://www.npmjs.com/package/dotenv) - For loading environment variables from a `.env` file.
- [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) - For hashing passwords and reading hashed passwords. It is used in the login function.
- [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken) - For creating a JWT for the user on login and for authenticating and authorizing the user on protected routes.
- [`mongoose`](https://www.npmjs.com/package/mongoose) - For connecting to a MongoDB database and for creating schemas and models for the different collections in the database. All the schemas and models can be found in `models/`
- [`nodemon`](https://www.npmjs.com/package/nodemon) (DevDependency) - For listening to changes when server is running in development.

## Using this repository and the REST API

This is what you need to know if you want to clone this repository and run this API:

- To get `node_modules/` you need to run the command `npm install`.
- The API has two scripts in `package.json`, one for production and one for development. Run `npm start` for production and `npm run devStart` for development. The later uses `nodemon`. The entrypoint for the API is `server.js`.
- To connect the API to a MongoDB-database and set a secret for the JWT you need a `.env` file. Modify `.env.example` with your information and rename it to `.env`.
- At the end of `server.js` you can specify your port and then use the API at: http://localhost:your-port/. It is set to 3000 now.
- Right now, for the purposes of this school assignment, I don't have a registering function in my code because I didn't have time to validate that function properly. You would have to build such a function with `bcryptjs` if you want to register a user that can login. Also, if you register a user and login with that user, in `routes/authentication.js` the JWT is set with an expiration for two hours. I have not created separate access- and refresh tokens at this time. When you login, you get the token. Add that with a **Authorization** header that has the value of "Bearer /your-token/".




