const { User } = require('./models');
const express = require('express')
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session')
const bcrypt = require('bcrypt');
const path = require('path')

app = express()
app.set('port', 3002)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "Shh, its a secret!" }));

//handlebars middleware
app.set('view engine', 'html');
app.engine('html', hbs({
	extname: 'html',
	defaultView: 'default',
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
}))
app.use(express.static(path.join(__dirname, 'static')));

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
						console.log("here1")
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

app.post('/sign-up', function (req, res) {

})

// start up the server
var server = app.listen(app.get('port'), function () {
	console.log("Server started...")
})