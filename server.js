'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const models = require('./models');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const responseTime = require('response-time');
const boom = require('express-boom');
const compression = require('compression');
const {
  cookieSecretKey,
} = require('./config/server.config');
const app = express();
const whitelist = ['http://localhost:4200', 'http://localhost:4000', 'https://urepost.com'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  maxAge: 86400,
  preflightContinue: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));
app.use(bodyParser.json({
  limit: '50mb',
}));
app.use(logger('dev'));
app.use(expressValidator());
app.use(cookieParser());
app.use(boom());
app.use(compression());

app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, 'static')));

app.use(responseTime());

app.use((req, res, next) => {
  if (req.url.match(/^\/(css|img|font)\/.+/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache header
  }
  next();
});

app.use((req, res, next) => {
  if (req.subdomains.includes('admin')) {
    express.static(path.join(__dirname, '../ngx-admin/dist'));
  };
  next();
});


app.use(session({
  secret: cookieSecretKey,
  proxy: true,
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: models.sequelize,
  }),
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // Milliseconds (3600000ms -> 60min)
  },
})); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.disable('x-powered-by');

app.set('trust proxy', true);
app.use('/api', require('./controllers/account.controller'));
app.use('/api/admin', require('./super-admin/controllers/account.controller'));
app.use('/api', require('./controllers/user.controller'));
// app.use('/api/advertiser', require('./controllers/advertiser/advertiser.controller'));
// app.use('/api/user', require('./controllers/user/user.controller'));

app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: (app.get('env') === 'development') ? err : {}
//   });
// });

models.sequelize.sync().then(() => {
  const server = app.listen(3000, () => {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
  });
});
