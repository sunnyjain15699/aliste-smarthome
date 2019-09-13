const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Why do we need to set global vars using app.use()


require('./models/User')

const keys = require('./config/keys');

// passport for authentication logic
const passport = require('passport');
require('./config/passport')(passport);

const auth = require('./routes/auth');


// Database Logic
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
 useNewUrlParser: true
}).then((data) => console.log('MongoDb connected database : ', data.connections[0].name))
.catch(err => console.log(err))


// Middleware Logic

app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized : false
}))

// Passport MIddleware Logic
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', auth);

// Route Logic
app.get('/', (req, res)=>{
    res.send('it works');
})



// POrt Logic
const port = process.env.PORT || 5000
app.listen(port , ()=>{
    console.log(`Server started at ${port}`);
})

