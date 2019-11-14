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
}));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
	res.render('welcome')
});

// start up the server
var server = app.listen(app.get('port'), function () {
	console.log("Server started...")
})