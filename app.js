// Libraries and dependencies
const { sequelize, User, Card, CardSet, Liked } = require("./models");
const express = require("express");
const hbs = require("express-handlebars");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

// Initialize Express
app = express();
app.set("port", 3002);

// Initialize body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Express Session
app.use(session({ secret: "Shh, its a secret!" }));

//Handlebars Middleware
app.set("view engine", "html");
app.engine(
	"html",
	hbs({
		extname: "html",
		defaultView: "default",
		layoutsDir: __dirname + "/views/layouts/",
		partialsDir: __dirname + "/views/partials/"
	})
);

// Handlebars helpers
Handlebars.registerHelper("debug", function (optionalValue) {
	console.log("Current Context");
	console.log("====================");
	console.log(this);
});

Handlebars.registerHelper("modThree", function (value, options) {
	if (value % 3 == 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

Handlebars.registerHelper("isZero", function (value, options) {
	if (value === 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

Handlebars.registerHelper("notZero", function (value, options) {
	if (value != 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});

// Set static directoty
app.use(express.static(path.join(__dirname, "static")));

//////////////
// Routes
//////////////

// Default route
app.get("/", async function (req, res) {
	if (req.session.user == null) {
		res.render("welcome");
	} else {
		var cardSets = await CardSet.findAll({
			raw: true,
			where: { user_id: req.session.user.user_id },
			order: [["cardSet_name", "DESC"]]
		});
		res.render("home", { user: req.session.user, cardSets: cardSets });
	}
});

app.get("/welcome", async (req, res) => {

	try {
		var t = await sequelize.transaction();
		var cardSets = await CardSet.findAll({ order: [["popularity", "DESC"]], transaction: t });
		res.render("welcome", { cardSets: cardSets })
		t.commit();

	}
	catch (e) {
		console.log(e);
		t.rollback();
	}

});

app.get("/login", function (req, res) {
	if (req.session.user != null) {
		res.redirect("/");
	} else {
		res.render("login");
	}
});

app.get("/home", async function (req, res) {
	// req.session.user = await User.findByPk(14, { raw: true });
	if (req.session.user == null) {
		res.redirect("/");
	} else {
		try {
			// Get the users card sets!
			var cardSets = await CardSet.findAll({
				raw: true,
				where: { user_id: req.session.user.user_id },
				order: [["cardSet_name", "DESC"]]
			});
			const userWithLikedCardSets = await User.findByPk(req.session.user.user_id, {
				attributes: {},
				include: [{
					model: CardSet,
					as: "LikedCardSets",
					through: {
						model: Liked,
					}
				}],
			});

			var likedCardSets = userWithLikedCardSets.LikedCardSets;
			res.render("home", { user: req.session.user, cardSets: cardSets, likedCardSets: likedCardSets });
		}
		catch (e) {
			console.log(e);
		}

	}
});

// Register function that uses true async methods
app.post("/sign-up", async function (req, res) {
	// Catch username and password and confirm password
	username = req.body.username.trim();
	password = req.body.password;
	confirm_password = req.body.confirm_password;

	// Dictionary to log errors
	errors = [];

	if (username == "") {
		errors.push("Error: Username cannot be blank!");
	} else {
		// Query to check if the user already exists
		try {
			var user = await User.findOne({
				raw: true,
				where: { username: username }
			});
		} catch (e) {
			console.log(e);
		}

		if (user != null) {
			username = "";
			errors.push("Error: username already exists");
		}
	}
	if (password == "") {
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
			});

			req.session.user = user.dataValues;
			res.redirect("/home");
		} catch (e) {
			console.log(e);
		}
	} else {
		res.render("sign-up", { errors: errors, username: username });
	}
});

// Updated login function using consistent async calls
app.post("/login", async function (req, res) {
	// Catch variables from POST request
	username = req.body.username;
	password = req.body.password;

	var user;

	// Check if password is empty
	if (username != "" && password != "") {
		// Try to look for the user, if none found then display error
		try {
			// Query to find user
			user = await User.findOne({ raw: true, where: { username: username } });

			// If user found, check password
			if (user != null) {
				hash = user["password_hash"];

				// Await for bcrypt promise
				var isCorrect = await bcrypt.compare(password, hash);

				// If password correct, redirect user home else, show error
				if (isCorrect) {
					req.session.user = user;
					res.redirect("/home");
				} else {
					res.render("login", { error: true, username: username });
				}
			} else {
				res.render("login", { error: true, username: username });
			}
		} catch (e) {
			console.log(e);
		}
	} else {
		res.render("login", { error: true, username: username });
	}
});

app.get("/logout", function (req, res) {
	req.session.user = null;
	res.redirect("/");
});

app.get("/sign-up", function (req, res) {
	if (req.session.user != null) {
		res.redirect("/");
	} else {
		res.render("sign-up");
	}
});

app.get("/create-flash", function (req, res) {
	if (req.session.user == null) {
		res.redirect("/");
	} else {
		res.render("create-flash", { user: req.session.user });
	}
});

app.post("/create-flash", async function (req, res) {
	var cardSet = await CardSet.create({
		cardSet_name: req.body.title,
		cardSet_description: req.body.description,
		user_id: req.session.user.user_id,
		popularity: 0
	});

	id = cardSet.dataValues.cardSet_id;
	cards = [];

	req.body.flashcards.forEach(flashcard => {
		card = {
			card_front: flashcard.term,
			card_back: flashcard.definition,
			cardSet_id: id
		};
		cards.push(card);
	});
	await Card.bulkCreate(cards);
	res.sendStatus(200);
});

///////
// SQL queries no rendering
//////

// Deletes liked association
app.delete('/deleteLike/:id', async (req, res) => {

	try {
		var t = await sequelize.transaction();
		await Liked.destroy({ where: { cardSet_id: req.params.id }, transaction: t });
		await t.commit();
		// await t.rollback();
		res.status(200).send();
	}
	catch (e) {
		console.log(e);
		await t.rollback();
		res.status(400).send();
	}
});

// Deletes a  users card
app.delete("/deleteCardSet/:id", async function (req, res) {
	try {
		var t = await sequelize.transaction();
		// Find all the card sets to delete 
		var cardSet = await CardSet.findByPk(req.params.id, {
			include: [{
				model: Card,
				as: "Cards",
			}],
			transaction: t,
		});
		await Liked.destroy({ where: { cardSet_id: req.params.id }, transaction: t });
		await cardSet.destroy({ transaction: t });
		await t.commit();
		// await t.rollback();
		return res.status(200).send();

	} catch (e) {
		console.log(e);
		if (t)
			await t.rollback();
		return res.status(400).send();
	}
});

//Display set page
app.get("/cardSet/:id", async function (req, res) {

	try {
		var cardSet = await CardSet.findByPk(req.params.id);
		var user = req.session.user;
		var isOwner;

		if (user)
			isOwner = user.user_id == cardSet.user_id;
		else 
			isOwner = false;


		// Updates popularity if user seeing flashcard is not the owner
		if (!isOwner) {
			try {
				var t = await sequelize.transaction();
				cardSet.popularity = cardSet.popularity + 1;
				await cardSet.save({ transaction: t });
				await t.commit();
			}
			catch (e) {
				console.log(e);
				await t.rollback();
			}

		}
		if (isOwner) {

		}
		// Set to data values only
		cardSet = cardSet.dataValues;
		cardSet.isOwner = isOwner;
		res.render('cardSetPage', {cardSet:cardSet, user:req.session.user})
	}
	catch (e) {
		console.log(e);
	}

})

///////
// SQL queries, no rendering
///////

app.post("/api/likeCardSet/", async (req, res) => {

	var idToLike = req.body.id;
	var user = req.session.user
	try {

		if (!user)
			throw "Login to save card sets!";
		try {
			var t = await sequelize.transaction();
			await Liked.create({
				user_id: user.user_id,
				cardSet_id: idToLike,
			}, {
				transaction: t
			});
			t.commit();
		}
		catch (e) {
			console.log(e);
			t.rollback();
		}
	}
	catch (e) {
		console.log(e);
		res.status(401).send(e);
	}


});

// Get all users
app.get("/api/getUsers", async (req, res) => {
	try {
		var users = await User.findAll({
			raw: true
		});
		res.json(users);
	} catch (e) {
		console.log(e);
	}
});

// Get all users and include card sets
app.get("/api/getUsersWithCardSets", async (req, res) => {
	try {
		var users = await User.findAll({
			raw: true,
			include: [{ model: CardSet, as: "CardSets" }]
		});
		res.json(users);
	} catch (e) {
		console.log(e);
	}
});

// Gets all cardsets
app.get("/api/getCardSets", async (req, res) => {
	try {
		var CardSets = await CardSet.findAll({
			raw: true,
			include: [{ model: Card, as: "Cards" }]
		});
		res.json(CardSets);
	} catch (e) {
		console.log(e);
	}
});

// Gets all cards
app.get("/api/getCards", async (req, res) => {
	try {
		var Cards = await Card.findAll({
			raw: true
		});
		res.json(Cards);
	} catch (e) {
		console.log(e);
	}
});

//Route to get card set json
app.get("/api/cardSet/:id", async function (req, res) {
	try {
		var set = await CardSet.findByPk(req.params.id, {
			include: [
				{
					model: Card,
					as: "Cards"
				},
				{
					model: User,
					attributes: ["username"]
				}]
		})

		res.json(set)
	}
	catch (e) {
		console.log(e);
	}
})

// start up the server
var server = app.listen(app.get("port"), function () {
	console.log("Server started...");
});
