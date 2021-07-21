const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // name ,email, photo, password, passwordConfirm
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    maxlength: [25, 'A name should be smaller than 25 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please Provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please Provide a Password'],
    minlength: [8, 'Password should be at least 10 character long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password required to match'],
    validate: {
      // This only works on Create Save and doesnt work on update
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
      select: false,
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //  Only run this function when password is actully modified
  if (!this.isModified('password')) return next();

  //  Hash the pasword with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  //  Delete the password confirm field
  this.passwordConfirm = undefined;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ! Instance method userPassword - hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // Token issues 100 < 200
  }
  //  False means not changed
  return false;
};

// instance method for forgot password to genrate random token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
