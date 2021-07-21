const mongoose = require('mongoose');
const dotenv = require('dotenv');
const spdy = require('spdy');
const fs = require('fs');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception Shutting down');
  console.log(err.name, err.message);
  // 0 stand for exit and 1 for uncaughtexception
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(connection);
    console.log('DB connection successful!');
  })
  .catch(() => console.log(`Database connection Error`));

// Reading SSL files
const options = {
  key: fs.readFileSync('./ssl/example.com+5-key.pem'),
  cert: fs.readFileSync('./ssl/example.com+5.pem'),
};

// Starting HTTP 2 server
const server = spdy.createServer(options, app).listen(3000, (err) => {
  if (err) {
    throw new Error(err);
  }

  console.log(`Listening to port 3000`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection Shutting down');
  console.log(err);
  // 0 stand for exit and 1 for uncaughtexception
  server.close(() => {
    process.exit(1);
  });
});

// console.log(process.env);

// Starting server
// const port = 3000;

// app.listen(port, () => {
//   console.log(`App running on Port 3000`);
// });
