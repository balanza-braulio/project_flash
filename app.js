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
	res.render('welcome')
})

app.get('/login', function (req, res) {
	res.render('login')
})

app.post('/login', function(req,res){
	username = req.body.username
	password = req.body.password
	console.log(username)
	console.log(password)
	res.render('login', {error:true})

})

app.get('/sign-up', function (req, res) {
	res.render('sign-up')
})

app.post('/sign-up', function(req,res){

})

// start up the server
var server = app.listen(app.get('port'), function () {
	console.log("Server started...")
})