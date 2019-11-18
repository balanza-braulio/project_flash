// Libraries and dependencies
const { sequelize, User, Card, Card_Set } = require('./models');
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

app.get('/home', function (req, res) {
	if (req.session.user == null) {
		res.redirect('/')
	} else {
		res.render('home', { user: req.session.user })
	}
})

app.post('/login', async function (req, res) {
	username = req.body.username
	password = req.body.password
	if (username != '' && password != '') {
		await User.findOne({ where: { username: username } }).then(async (user) => {
			if (user != null) {
				user = user['dataValues']
				hash = user['password_hash']
				await bcrypt.compare(password, hash, (err, match) => {
					if (match) {
						req.session.user = user
						res.redirect('/home')
					} else {
						res.render('login', { error: true, username: username })
					}
				});
			} else {
				res.render('login', { error: true, username: username })
			}
		})
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

app.post('/sign-up', async function (req, res) {
	username = req.body.username.trim()
	password = req.body.password
	confirm_password = req.body.confirm_password
	errors = {}

	if (username == '') {
		errors.username = { msg: "username cannot be blank" }
	} else {
		await User.findOne({ where: { username: username } }).then(user => {
			if (user != null) {
				username = ''
				errors.username = { msg: "username already exists" }
			}
		})
	}
	if (password == '') {
		errors.password = { msg: "password cannot be blank" }
	} else {
		if (password != confirm_password) {
			errors.password = { msg: "passwords do not match" }
		}
	}

	if (Object.entries(errors).length === 0) {
		bcrypt.hash(password, 10, (err, hash) => {
			User.create({
				username: username,
				password_hash: hash,
				admin: 0
			}).then(user => {
				req.session.user = user.dataValues
				res.redirect('/home')
			})
		});
	} else {
		res.render('sign-up', { errors: errors, username: username })
	}
})

// start up the server
var server = app.listen(app.get('port'), function () {
	console.log("Server started...")
})