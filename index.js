
// index.js

const mysql = require("mysql2"); 
const fs = require("fs")
const express = require("express"); 
const bodyParser = require("body-parser"); 
const hbs = require("hbs");
const expressHbs = require("express-handlebars");
const session = require("express-session");
const path = require('path');

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(express.json());

const hbsHelpers = require("./js/handlebars_helpers");


const loginRouter = require('./js/login');

const teacherDashboardRouter = require('./js/teacher_dashboard');
const studentDashboardRouter = require("./js/student_dashboard")

const journalRouter = require("./js/journal");
const gradesRouter = require("./js/server_grades");

const subjectsRouter = require("./js/server_subjects");
const subjectProfileRouter = require("./js/server_subject_profile")

const userProfileRouter = require("./js/server_user_profile");
const usersRouter = require("./js/server_users");

const groupsRouter = require("./js/server_subject_groups");
const groupProfileRouter = require("./js/server_group_profile");


app.use(express.static(__dirname + '/public'));
app.use(urlencodedParser);

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Create an instance of express-handlebars with custom helpers
const hbsInstance = expressHbs.create({
  layoutsDir: path.join(__dirname, "views/layouts"),
  partialsDir: path.join(__dirname, "views/partials"),
  defaultLayout: "main",
  extname: "hbs",

  helpers: hbsHelpers, // Додаємо хелпери
});


app.engine("hbs", hbsInstance.engine);
app.set("view engine", "hbs");


// Redirect the root URL to the login page
app.get("/", function (req, res) {
  res.redirect("/login");
});

// mounts 
app.use('/login', loginRouter);

app.use('/teacher_dashboard', teacherDashboardRouter);
app.use("/student_dashboard", studentDashboardRouter);
app.use('/grades', gradesRouter);
app.use("/journal", journalRouter);

// app.use("/groups", groupsRouter);
app.use("/group", groupProfileRouter);
app.use("/groups", groupsRouter);

app.use("/subjects", subjectsRouter);
app.use("/subject", subjectProfileRouter);

app.use("/user_profile", userProfileRouter);
app.use("/users", usersRouter);


app.get("/logout", (req, res) => {
    console.log("User log out");

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error destroying session");
    }
    res.redirect("/login"); // Redirect the user to the login page after logging out
  });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, function() { 
    console.log("Сервер запущено на порту " + PORT);
});
