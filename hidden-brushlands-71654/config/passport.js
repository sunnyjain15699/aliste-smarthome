const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const keys = require("./keys");
const mongoose = require("mongoose");
const User = mongoose.model("users");

const passAuthentication = passport => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.client_id,
        clientSecret: keys.client_secret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },

      (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value
        };

        User.findOne({
          googleId: profile.id
        }).then(user => {
          if (user) {
            done(null, user);
          } else {
            new User(newUser)
              .save()
              .then(user => done(null, user))
              .catch(err => console.log(err));
          }
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
};

module.exports = passAuthentication;
