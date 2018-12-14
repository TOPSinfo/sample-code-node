const passport = require('passport');
const request = require('request');
const passwordHash = require('password-hash');

// const { Strategy: InstagramStrategy } = require('passport-instagram');
const { Strategy: LocalStrategy } = require('passport-local');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const { jwtSecretKey, fbAppId } = require('./server.config.js');

const { Strategy: FacebookStrategy } = require('passport-facebook');
// const { Strategy: TwitterStrategy } = require('passport-twitter');
// const { Strategy: GitHubStrategy } = require('passport-github');
// const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
// const { Strategy: LinkedInStrategy } = require('passport-linkedin-oauth2');
// const { Strategy: OpenIDStrategy } = require('passport-openid');
// const { OAuthStrategy } = require('passport-oauth');
// const { OAuth2Strategy } = require('passport-oauth');
const models = require('../models');

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  models.Users.find({ where: { email: email.toLowerCase(),status: 'active' } }).then((user) => {
    if (!user) {
      return done(undefined, false, { message: `Email ${email} not found.` });
    }
    if (passwordHash.verify(password, user.password)) {
      return done(undefined, user);
    }
    else
      return done(undefined, false, { message: "Invalid password." });

  });
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken('Bearer'),
  secretOrKey: jwtSecretKey
},
  function (jwtPayload, cb) {
    //find the user in db if needed
    return models.Users.find({
      where: {
        id: jwtPayload.id,
        role: jwtPayload.role
      }
    })
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
));

passport.use(new FacebookStrategy({
  clientID: fbAppId,
  // clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    models.Users.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err) => {
            req.flash('info', { msg: 'Facebook account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      models.Users.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save((err) => {
            done(err, user);
          });
        }
      });
    });
  }
}));




/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  console.log('hello', req.isAuthenticated())
  if (req.isAuthenticated()) {

    return next();
  }
  console.log('hello')
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split("/").slice(-1)[0];
  console.log(provider, 'provider')
  if (_.find(req.user.tokens, { kind: provider })) {
    console.log('hello')
    next();
  } else {
    console.log('hello')
    res.redirect(`/auth/${provider}`);
  }
};