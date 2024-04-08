// index.js
const mysql = require("mysql2"); 
const fs = require("fs")
const express = require("express"); 
const bodyParser = require("body-parser"); 
const hbs = require("hbs");
const expressHbs = require("express-handlebars");
const session = require("express-session");

const path = require('path'); //робота з шляхами 11.9K (gzipped: 4.3K)
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false}); //для обробки РОЅT форм
const loginRouter = require('./js/login'); // Import the login route module
const teacherDashboardRouter = require('./js/teacher_dashboard'); // Import the login route module
const studentDashboardRouter = require("./js/student_dashboard"); // Import the login route module

app.use(express.static(__dirname + '/public'));
app.use(urlencodedParser);

const zagolovok = "Журнал викладача";

// Configure session middleware
app.use(session({
  secret: 'your-secret-key', // Replace 'your-secret-key' with a random string used to sign the session ID cookie
  resave: false,
  saveUninitialized: true
}));

app.engine("hbs", expressHbs({  
    layoutsDir: "views", 
    defaultLayout: "index",
    extname: "hbs",
    partialsDir: "views" 
}));

// Read the routes directory
const routesDir = path.join(__dirname, 'js'); // Assuming routes are in the 'js' directory
fs.readdirSync(routesDir).forEach(file => {
  const routePath = path.join(routesDir, file);
  const route = require(routePath);
  app.use('/', route); // Mount the routes onto the root path
});


app.set("view engine", "hbs");

app.get("/", function(req, res) { 
    res.render("login.hbs", {zagolovok: zagolovok});
});




app.use('/login', loginRouter);

// Mount the teacher_dashboard route module onto the '/teacher_dashboard' path
app.use('/teacher_dashboard', teacherDashboardRouter);

// Mount the teacher_dashboard route module onto the '/student_dashboard' path
app.use('/student_dashboard', studentDashboardRouter);

const PORT = process.env.PORT || 3000; // Use process.env.PORT instead of process.env. PORT
app.listen(PORT, function() { 
    console.log("Сервер запущено на порту " + PORT);
});
