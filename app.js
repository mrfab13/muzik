const express = require('express')
const mongoose = require('mongoose')
const passport = require("passport")
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose")
const app = express()
const port = 3000

mongoose.connect('mongodb://127.0.0.1/data', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Database connected!');
})
.catch(err => {
   console.error('Error connecting to database:', err);
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('login.ejs');
})

app.post('/', passport.authenticate('local', { 
  successRedirect: '/muzik', 
  failureRedirect: '/', 
  failureFlash: true 
}));

app.get('/register', (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await User.register(user, req.body.password);
    res.redirect('/');
  } catch (error) {
    res.render('error.ejs', { error });
  }
});

app.get('/muzik', isLoggedIn, (req, res) => {
  res.render('music.ejs');
});

app.get('/henryfat', (req, res) => {
  res.send('ha gottem');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
