// this file makes the database connection, collects all the models
// and sets the associations
// other files can use this for database access by requiring it and
// assigning the exports

// assuming that this file (index.js) is in a subdirectory called models:
//  const models = require('./models');

// or (using deconstruction):
//  const { Person, PhoneNumber, Address, PersonAddress } = require('./models');

'use strict';

// Database connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'flash.sqlite'
});


// Import models
const User = sequelize.import("./users.js");
const Card = sequelize.import("./card.js");
const CardSet = sequelize.import("./cardSet.js");
const Liked = sequelize.import("./liked.js");

// Create assosiations
User.hasMany(CardSet,{foreignKey: "user_id", as: "CardSets"});
CardSet.belongsTo(User, {foreignKey: "user_id"});
CardSet.hasMany(Card, {foreignKey: "cardSet_id", as: "Cards"});
Card.belongsTo(CardSet, {foreignKey: "cardSet_id"});
User.belongsToMany(CardSet, {
  through: 'liked',
  as: 'LikedCardSets',
  foreignKey: 'user_id',
  otherKey: 'cardSet_id'
});
CardSet.belongsToMany(User, {
  through: 'liked',
  as: 'Users',
  foreignKey: 'cardSet_id',
  otherKey: 'user_id'
});
module.exports = {

  // Export instance of sequelize for transactions
  sequelize,
  Sequelize,
  // Export Models
  User,
  Card,
  CardSet,
  Liked
};

