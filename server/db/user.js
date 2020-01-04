const Sequelize = require('sequelize');
const crypto = require('crypto');
const _ = require('lodash');
const db = require('./index');

const User = db.define(
  'user',
  {
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    googleId: {
      type: Sequelize.STRING,
    },
    salt: {
      type: Sequelize.STRING,
    },
  },
  {
    hooks: {
      beforeCreate: setSaltAndPassword,
      beforeUpdate: setSaltAndPassword,
    },
  }
);

//instance methods
//the example was this.Model.encryptPassowrd
User.prototype.correctPassword = function(candidatePassword) {
  return User.encryptPassword(candidatePassword, this.salt) === this.password;
};

User.prototype.sanitize = function() {
  return _.omit(this.toJSON(), ['password', 'salt']);
};

// class methods
User.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64');
};

//look up options in crypto to understand sha1 and hex
User.encryptPassword = function(plainText, salt) {
  const hash = crypto.createHash('sha1');
  hash.update(plainText);
  hash.update(salt);
  return hash.digest('hex');
};

function setSaltAndPassword(user) {
  if (user.changed('password')) {
    user.salt = User.generateSalt();
    user.password = User.encryptPassword(user.password, user.salt);
  }
}

module.exports = User;
