var createError = require('http-errors'),
  express = require('express'),
  path = require('path'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  flash = require('connect-flash');

var indexRouter = require('./routes/index'),
  userRouter = require('./routes/user');

var User = require('./schemas/User')

const openDatabaseConnection = async () => {
  console.info(`[Auth] [Database] Opening connection to database`);
  await mongoose.connect('mongodb://localhost:27017/auth', {}).then(
    () => {
      console.info(`[Auth] [Database] Opened connection to database`);
    },
    (error) => {
      console.info(`[Auth] [Database] Connection Error:`);
      console.error(error.stack);
      process.exit(1);
    }
  );
};

openDatabaseConnection().catch((error) => console.error(error));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
/*
app.use(bodyParser.urlencoded({
  extended: true
}));
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  require('express-session')({
    secret: 'Any normal Word', //decode or encode session
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); //session encoding
passport.deserializeUser(User.deserializeUser()); //session decoding

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;