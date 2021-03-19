const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  "local.register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(
            null,
            false,
            req.flash("errors", "چنین کاربری قبلا ثبت نام کرده")
          );
        }
        let hashpassword;
        bcrypt
          .hash(password, 10, (err, hash) => {
            if (err) console.log(err);
            hashpassword = hash;
            const newUser = new User({
              name: req.body.name,
              email: req.body.email,
              password: hashpassword,
            });
            newUser.save((err) => {
              if (err)
                return done(
                  null,
                  false,
                  req.flash("errors", "ثبت نام با موفقیت انجام نشد")
                );
              done(null, newUser);
            });
          })
      });
    }
  )
);

passport.use(
  "local.login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash("errors", "اطلاعات مطابقت ندارد"));
        }
        if (!user.comparePassword(password)) {
          return done(null, false, req.flash("errors", "پسورد صحيح نيست"));
        }
        done(null, user);
      });
    }
  )
);

//Google-----------------------------------------------

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.client_key_google,
      clientSecret: process.env.secret_key_google,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        password: profile.id,
        image: profile.photos[0].value,
        active: true,
      };

      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (error) {
        console.error(error);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
