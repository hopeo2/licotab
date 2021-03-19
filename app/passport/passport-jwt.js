const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');


passport.use('jwt',new JwtStrategy({
    jwtFromRequest : ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('api_token')
    ]),
    secretOrKey : process.env.jwt,
} , async (jwtPayload , done ) => {
    try {
        let user = await User.findById(jwtPayload.id);

        if(user) done(null , user)
        else done(null , false , { message : 'شما اجازه دسترسی به این لینک را ندارید'})

    } catch (err) { 
        done(null , false , { message : err.message})
    }
}))

