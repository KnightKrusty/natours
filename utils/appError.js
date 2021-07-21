class AppError extends Error {
  constructor(message, statusCode) {
    // parent class is error and whatever we pass into it will be set as message
    // that is why we didnt set this.message : message
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
