const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const schema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'You must provide an email'],
    unique: [true, 'That email is already in use'],
    minLength: [5, 'Email must be at least 5 characters'],
    maxLength: [254, 'Email must not exceed 254 characters'], // 254 (256 only when intercepting emails, which includes '<>' around email)
  },
  username: {
    type: String,
    required: [true, 'You must provide a username'],
    unique: [true, 'That username is already in use'],
    minLength: [3, 'Username must be at least 3 characters'],
    maxLength: [32, 'Username must not exceed 32 characters'],
  }
});

schema.plugin(passportLocalMongoose, {
  errorMessages: {
    MissingPasswordError: 'No password was given',
    AttemptTooSoonError: 'Account is currently locked. Try again later',
    TooManyAttemptsError: 'Account locked due to too many failed login attempts',
    NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
    IncorrectPasswordError: 'Password or username are incorrect',
    IncorrectUsernameError: 'Password or username are incorrect',
    MissingUsernameError: 'No username was given',
    UserExistsError: 'That username is already in use.'
  }
});

module.exports = mongoose.model('User', schema);

// const Post = require('./models/Post') // new