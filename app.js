//const config = require("./config.json");

const base64 = require('base-64');
//const mariadb = require('mariadb');
const express = require('express')
const bodyParser = require('body-parser');
const argon2 = require('argon2');

//const pool = mariadb.createPool(config.dbInfo);

const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: true }));

var dbConnection;

// Connect to db
async function InitaliseDBConnection() {
  try
  {
    dbConnection = await pool.getConnection();
    const db = await dbConnection.query("USE USERDATA");
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

  var hash = await argon2.hash(Password);
  hash = base64.encode(hash);

  const response = await dbConnection.query("INSERT INTO USERS (USERNAME, PASSWORD) VALUES ('" + Username + "', '" + hash + "')");
	console.log(response);
}

async function VerifyUser(Username, Password)
{
  const query = "SELECT PASSWORD FROM USERS WHERE USERNAME = '" + Username + "'";
  var hash = await dbConnection.query(query);

  if (hash.length == 0)
  {
    // No User By Name
    return false;
  }

  hash = hash[0].PASSWORD;

  hash = base64.decode(hash);

  if (await argon2.verify(hash, Password)) 
  {
    //Correct Password
    return true;
  }
  else
  {
    //Wrong Password
    return false;
  }

}

//InitaliseDBConnection();

//
/// REMOVE THIS LATER, MAYBE WITH A POST + AUTH
//
app.get('/reboot', (req, res) => {
  process.exit(0)
})

app.get('/', (req, res) => {
   res.render('landing.ejs', {username: ""});
})

app.post('/', async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;

  // Stage 1 Landing Submission
  if (password == "")
  {
      // TODO: Send render back with vars to say to render password field
      res.render("landing.ejs", {username : username});
      return;
  }

  const result = true;
  //const result = await VerifyUser(username, password);
  if (result === true)
  {
    // You can now use the username and password variables as needed
    // res.send(`Found username: ${username}, password: ${password}`);

    // Redirect to media page
    res.render("music.ejs")
  }
  else
  {
    // If the user was wrong send them back to the start
    res.render("landing.ejs", {username: ""})
  }
});

app.get('/login', (req, res) => {
   res.render('landing.ejs', {username: ""});
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password

  AddNewUser(username, password);

  // You can now use the username and password variables as needed
  res.send(`Registered username: ${username}, password: ${password}`);
});

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
