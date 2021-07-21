const process = require('process');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middleware : fn modify incoming request data, data from the body add to the request

// serving static content of public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set Security Header
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// 1. Middleware
if (process.env.NODE.ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit the http request
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Please try again in an hour',
});

app.use('/api', limiter);

// Body Parser Reading data form the body req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization againts noSql query injection

app.use(mongoSanitize());

// Data sanitization against xss

app.use(xss());

// Prevent Parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime);
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 2. Route
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Error Handling Router (Position should be last in the route so it wont catch other request)
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

// Global error hanlder - inside utils folder
app.use(globalErrorHandler);

module.exports = app;
