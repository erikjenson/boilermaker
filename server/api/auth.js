const router = require('express').Router();
const User = require('../db/user');
const passport = require('passport');

//this router will check for a session and pass to log-in
//or sign-up, or home page.

router.use(passport.initialize());
router.use(passport.session());

//serializes user on req object / session
passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    done(err);
  }
});

//deserializes user info on req object / session
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(done);
});

//get user that is logged in
router.get('/me', (req, res, next) => {
  res.json(req.user);
});

//log out user
router.delete('/logout', (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.sendStatus(204);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// collect our google configuration into an object
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
};

// configure the strategy with our config object, and write the function that passport will invoke after google sends
// us the user's profile and access token
const strategy = new GoogleStrategy(googleConfig, function(
  token,
  refreshToken,
  profile,
  done
) {
  const googleId = profile.id;
  const name = profile.displayName;
  const email = profile.emails[0].value;

  User.findOne({ where: { googleId: googleId } })
    .then(function(user) {
      if (!user) {
        return User.create({ name, email, googleId }).then(function(user) {
          done(null, user);
        });
      } else {
        done(null, user);
      }
    })
    .catch(done);
});

// register our strategy with passport
passport.use(strategy);

//login using google OAuth
//what is {scope: email}?
//does authenticate add a serialized user to the store?
router.get('/google', passport.authenticate('google', { scope: 'email' }));

//this responds to the callback given to google
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);

//login returning user
router.put('/login', async (req, res, next) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (!user) res.status(401).send('User not found');
  else if (!user.correctPassword(req.body.password))
    res.status(401).send('Incorrect password');
  else {
    user.sanitize(); //before getting serialized?
    //sanitize removes pword and salt from user info on res obj
    req.login(user, err => {
      if (err) next(err);
      else res.json(user);
    });
  }
});

//sign-up new user
router.post('/sign-up', async (req, res, next) => {
  const newUser = await User.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (newUser) res.status(406).send('User already exists');
  else {
    //create a new user
    const user = User.create(req.body);
    user.sanitize();
    req.login(user, err => {
      if (err) next(err);
      else res.json(user);
      //this is sending the user info on the res obj
      //if it has been serialized isn't it there alreaady?
    });
  }
});

module.exports = router;
