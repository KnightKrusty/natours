const AppError = require('../utils/appError');

// Databse error when requesting tour using ID
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Regex to extract text
const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid Token. Please Login Again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has Expired, Login again.', 401);

// Express error handling middleware function
const sendErrorDev = (err, req, res) => {
  // handle Api error
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // Render Error Pages
  else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // Operational, Trusted error: send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: dont leak error details
    // 2) send generic error
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

// Do look into destructing
module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log(`err ${err}`);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // console.log(err.code);

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldDB(err);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
