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

// Create assosiations
User.hasMany(CardSet,{foreignKey: "user_id", as: "CardSets"});
CardSet.belongsTo(User, {foreignKey: "user_id"});
CardSet.hasMany(Card, {foreignKey: "cardSet_id", as: "Cards"});
Card.belongsTo(CardSet, {foreignKey: "cardSet_id"});

module.exports = {

  // Export instance of sequelize for transactions
  sequelize,

  // Export Models
  User,
  Card,
  CardSet
};

