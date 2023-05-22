const config = require("./config.json");

const mariadb = require('mariadb');
const express = require('express')

const pool = mariadb.createPool(config.dbInfo);

var dbConnection;

// Connect to db
async function InitaliseDBConnection() {
  try 
  {
    dbConnection = await pool.getConnection();
    const res1 = await dbConnection.query("USE USERDATA");
    AddNewUser("Henry", "Password");
    const res = await dbConnection.query("SELECT * FROM USERS");
	  console.log(res);
  } 
  catch (err) 
  {
    console.log(err);
  }
  return;
}

async function AddNewUser(Username, Password){
  const res = await dbConnection.query("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('" + Username + "', '" + Password + "')");
	console.log(res);
}

InitaliseDBConnection();

const app = express()
const port = 80

app.get('/', (req, res) => {
   res.render('login.ejs');
})

// app.post('/', passport.authenticate('local', { 
//   successRedirect: '/muzik', 
//   failureRedirect: '/', 
//   failureFlash: true 
// }));

app.get('/register', (req, res) => {
   res.render('register.ejs');
});

// app.post('/register', async (req, res) => {
//   try {
//     const user = new User({ username: req.body.username, password: req.body.password });
//     await User.register(user, req.body.password);
//     res.redirect('/');
//   } catch (error) {
//     res.render('error.ejs', { error });
//   }
// });

// app.get('/muzik', isLoggedIn, (req, res) => {
//    res.render('music.ejs');
// });

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   } else {
//     res.redirect('/');
//   }
// }

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
