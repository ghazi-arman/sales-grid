var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
require('dotenv').config()


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/getSalesByRow', function (req, res) {
  const startRow = parseInt(req.query.startRow);
  const endRow = parseInt(req.query.endRow);
  if (isNaN(startRow) || isNaN(endRow)) {
    return res.status(400).send('Invalid query parameters. Please supply an integer value to startRow and endRow.'); 
  }
  connection.query('SELECT * FROM Sales LIMIT ?, ?', [startRow, endRow], function (error, results, fields) {
    if (error) {
      console.log(error);
      return res.status(500).send('Error when querying database.');
    }
    res.send(results);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
