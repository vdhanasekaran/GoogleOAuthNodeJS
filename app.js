// Required dependencies 
const express = require('express');
const app = express();
const mysql = require('mysql');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const connection = mysql.createConnection('mysql://root:Krishn@ven1@localhost/Student?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');
connection.connect(function(err) {
    if (err) throw err;
});

// cookieSession config
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: ['randomstringhere']
}));

app.use(passport.initialize()); // Used to initialize passport
app.use(passport.session()); // Used to persist login sessions

// Strategy config
passport.use(new GoogleStrategy({
        clientID: '597114693786-9h6g9p1i4bj1tu3m91squ2ljed3e2hd4.apps.googleusercontent.com',
        clientSecret: 'unPLQ1jkQAwB6ECDtnSxhbQi',
        callbackURL: 'http://localhost:5000/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        done(null, profile); // passes the profile data to serializeUser
    }
));

// Used to stuff a piece of information into a cookie
passport.serializeUser((user, done) => {
    done(null, user);
});

// Used to decode the received cookie and persist session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Middleware to check if the user is authenticated
function isUserAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send('You must login!');
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// passport.authenticate middleware is used here to authenticate the request
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Used to specify the required data
}));

// The middleware receives the data from Google and runs the function on Strategy config
app.get('/auth/google/callback', (req, res, next)=> {
    passport.authenticate('google', function(err, user, info) {
        if(err) {
            res.send("Authentication Failed");
        } else {
            const email = user._json.email;
            const lastName = user._json.family_name;
            const firstName = user._json.given_name;
            const profilePictureURL = user._json.picture;
            const displayName = user._json.name;
            const userId = email.split('@')[0];
            const profilePicture = user._json.picture;

            connection.query("insert into Student(`OrganizationId`,`First Name`,`Last Name`,`Sex`,`DOB`,`Email`,`Mobile`,`WhatzApp`,`Address 1`,`Address 2`,`City`,`State`,`Pincode`,`Country`,`Qualification`,`CreatedWhen`,`CreatedBy`,`RegisteredIP`,`UserId`,`ProfilePicture`) values(1,'"+ firstName +"','"+ lastName +"','F','2000-01-01 00:00:00', '" + email + "', 9940135998,9940135998,'Add 1','Add 2','Chennai','TamilNadu',600064,'INDIA','BE','2019-11-30 14:14:13','Admin','10,0,0,1','" + userId + "','" + profilePicture + "')", function(err, res) {
                if(err) {
                    console.log(err);
                    //res.send("Error occured");
                } else {
                    console.log(res);
                    //res.send("Inserted");
                }    
            });
            res.send(user);
        }
    })(req, res, next);
});

// Secret route
app.get('/secret', isUserAuthenticated, (req, res) => {
    res.send('You have reached the secret route');
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(); 
    res.redirect('/');
});

app.listen(5000, () => {
    console.log('Server Started!');
});