const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const db = require('./db/index');

if (process.env.NODE_ENV === 'development') {
  require('./secrets'); // this will mutate the process.env object with your secrets.
}

// configure and create our database session store
// const SequelizeStore = require('connect-session-sequelize')(session.Store);
// const dbStore = new SequelizeStore({ db: db });

// sync so that our session table gets created.  remember to lose {force:true} after development
// dbStore.sync();

// plug the store into our session middleware // add secret to config //file variable and gitignore it.
app.use(
  session({
    secret: process.env.SESSION_SECRET, //this is defined in secrets.js while in development
    //store: dbStore,
    resave: false,
    saveUninitialized: false,
  })
);

//static middleware
app.use(express.static(path.join(__dirname, '../public')));

//logging middleware
app.use(morgan('dev'));

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serve up api routes
app.use('/api', require('./api'));

// Handle 404s
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//catching 500 errors
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

//serves up index.html when no routes are hit
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = process.env.PORT || 3000; // this can be very useful if you deploy to Heroku!

db.sync({ force: true }) // sync our database, remember to lose {force:true} after development!!
  .then(function() {
    app.listen(port, function() {
      console.log('Knock, knock');
      console.log("Who's there?");
      console.log(`Your server, listening on port ${port}`);
    }); // then start listening with our express server once we have synced
  });
