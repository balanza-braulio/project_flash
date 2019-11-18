// Libraries and dependencies
const { sequelize, User, Card, CardSet } = require('./models');
const express = require('express')
const hbs = require('express-handlebars');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const session = require('express-session')
const bcrypt = require('bcrypt');
const path = require('path')

// Initialize Express
app = express()
app.set('port', 3002)

// Initialize body parser
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

// Handlebars helpers
Handlebars.registerHelper("debug", function (optionalValue) {
	console.log("Current Context");
	console.log("====================");
	console.log(this);
});

Handlebars.registerHelper('modThree', function (value, options) {
	if (value % 3 == 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

Handlebars.registerHelper('isZero', function (value, options) {
	if (value === 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

 Handlebars.registerHelper('notZero', function (value, options) {
	if (value != 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

// Set static directoty 
app.use(express.static(path.join(__dirname, 'static')));


//////////////
// Routes
//////////////

// Default route
app.get('/', function (req, res) {
	if (req.session.user == null) {
		res.render('welcome')
	} else {
		res.render('home', { user: req.session.user })
	}
})

app.get('/login', function (req, res) {
	if (req.session.user != null) {
		res.redirect('/')
	} else {
		res.render('login')
	}
})

app.get('/home', async function (req, res) {
	if (req.session.user == null) {
		res.redirect('/')
	} else {

		// Get the users card sets!
		var cardSets = await CardSet.findAll({
			raw: true,
			where: { user_id: req.session.user.user_id },
			order: [["cardSet_name", "DESC"]]
		})

		res.render('home', { user: req.session.user, cardSets: cardSets })
	}
})

// Register function that uses true async methods
app.post('/sign-up', async function (req, res) {

	// Catch username and password and confirm password
	username = req.body.username.trim()
	password = req.body.password
	confirm_password = req.body.confirm_password

	// Dictionary to log errors
	errors = [];

	if (username == '') {
		errors.push("Error: Username cannot be blank!");
	} else {
		// Query to check if the user already exists
		try {
			var user = await User.findOne({ raw: true, where: { username: username } });
		}
		catch (e) {
			console.log(e);
		}

		if (user != null) {
			username = ''
			errors.push("Error: username already exists");
		}
	}
	if (password == '') {
		errors.push("Error: password cannot be blank");
	} else {
		if (password != confirm_password) {
			errors.push("Error: passwords do not match!");
		}
	}

	if (errors.length === 0) {
		var password_hash = await bcrypt.hash(password, 10);
		try {

			var user = await User.create({
				username: username,
				password_hash: password_hash,
				admin: 0
			})

			req.session.user = user.dataValues
			res.redirect('/home')

		}
		catch (e) {
			console.log(e);
		}
	} else {
		res.render('sign-up', { errors: errors, username: username })
	}
})

// Updated login function using consistent async calls
app.post('/login', async function (req, res) {

	// Catch variables from POST request
	username = req.body.username
	password = req.body.password

	var user;

	// Check if password is empty
	if (username != '' && password != '') {
		// Try to look for the user, if none found then display error
		try {

			// Query to find user
			user = await User.findOne({ raw: true, where: { username: username } });

			// If user found, check password
			if (user != null) {
				hash = user['password_hash'];

				// Await for bcrypt promise
				var isCorrect = await bcrypt.compare(password, hash);

				// If password correct, redirect user home else, show error					
				if (isCorrect) {
					req.session.user = user
					res.redirect('/home')
				} else {
					res.render('login', { error: true, username: username })
				}
			} else {
				res.render('login', { error: true, username: username })
			}
		}
		catch (e) {
			console.log(e);
		}
	} else {
		res.render('login', { error: true, username: username })
	}
})


app.get('/logout', function (req, res) {
	req.session.user = null
	res.redirect('/')
})

app.get('/sign-up', function (req, res) {
	if (req.session.user != null) {
		res.redirect('/')
	} else {
		res.render('sign-up')
	}
})

///////
// SQL queries, send data as response
//////

// Get all users 
app.get("/api/getUsers", async (req, res) => {

	try {
		var users = await User.findAll({
			raw: true,
		})
		res.json(users);
	}
	catch (e) {
		console.log(e);
	}
})

// Get all users and include card sets
app.get("/api/getUsersWithCardSets", async (req, res) => {

	try {
		var users = await User.findAll({
			raw: true,
			include: [{ model: CardSet, as: "CardSets" }]
		})
		res.json(users);
	}
	catch (e) {
		console.log(e);
	}

})

app.get("/api/getCardSets", async (req, res) => {

	try {
		var CardSets = await CardSet.findAll({
			raw: true,
			include: [{ model: Card, as: "Cards" }],
		});
		res.json(CardSets);
	}
	catch (e) {
		console.log(e);
	}
})

app.get("/api/getCards", async (req, res) => {

	try {
		var Cards = await Card.findAll({
			raw: true,
		});
		res.json(Cards);
	}
	catch (e) {
		console.log(e);
	}
});

//Display set page
app.get('/cardSet/:id', async function (req, res) {
	try {
		var set = await CardSet.findByPk(req.params.id)

		res.render('cardSetPage', set)
	}
	catch (e) {
		console.log(e);
	}
})

//Route to get card set json
app.get('/cardSetJson/:id', async function (req, res) {
	var set = await CardSet.findByPk(req.params.id, {
		include: [{
			model: Card,
			as: "Cards"
		}]
	})

	res.json(set)
})

// start up the server
var server = app.listen(app.get('port'), function () {
	console.log("Server started...")
})