////// Test file to check if associations work

// Libraries and dependencies
const { sequelize, User, Card, CardSet } = require('./models');
const express = require('express')
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session')
const bcrypt = require('bcrypt');
const path = require('path')

// Initialize Express
app = express()
app.set('port', 3002)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Express Session 
app.use(session({ secret: "Shh, its a secret!" }));

//Handlebars Middleware
app.set('view engine', 'html');
app.engine('html', hbs({
	extname: 'html',
	defaultView: 'default',
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
}))

// Set static directoty 
app.use(express.static(path.join(__dirname, 'static')));

async function main() {

	var temp = await User.findAll();
	temp.forEach(async user => {
		try{
			var tempCard = await CardSet.create({
			cardSet_name: "test",
			user_id: user.user_id,
		});
		}
		catch (e){
			console.log(e);
		}
		
		
		var userWithCardSet =  await User.findAll({
			include: [{model: CardSet, as: "CardSets"}],
		});
		console.log(userWithCardSet);
	});
	
}
main();