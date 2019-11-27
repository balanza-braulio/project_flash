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
app.use(function (req, res, next) {
	app.locals.session = req.session;
	next();
});

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

Handlebars.registerHelper("inc", function (value, options) {
	return parseInt(value) + 1;
});


Handlebars.registerHelper("isCardSetFav", (cardSet_id, likedCardSets, options) => {

	if (likedCardSets.length == 0)
		return options.inverse(this);
	// Have to do this to use find
	var found = likedCardSets.find(element => element.cardSet_id == cardSet_id);
	if (found)
		return options.fn(this);
	else
		return options.inverse(this);
});

// Handlebars method to check if user is logged in
Handlebars.registerHelper("isLogged", function (block) {
	var user = app.locals.session.user;
	if (user)
		return block.fn(this);
	else
		return block.inverse(this);
});

Handlebars.registerHelper("isEqual", function (a, b, options) {
	if (a == b)
		return options.fn(this);
	else
		return options.inverse(this);
})

Handlebars.registerHelper("isNotEqual", function (a, b, options) {
	if (a != b)
		return options.fn(this);
	else
		return options.inverse(this);
})

// Set static directoty
app.use(express.static(path.join(__dirname, "static")));

//////////////
// Routes
//////////////

// Default route
app.get("/", async function (req, res) {
	if (req.session.user == null) {
		res.redirect("/welcome");
	} else {
		var cardSets = await CardSet.findAll({
			raw: true,
			where: { user_id: req.session.user.user_id },
			order: [["cardSet_name", "DESC"]]
		});
		res.redirect("/home");
	}
});

app.get("/welcome", async (req, res) => {

	try {
		var t = await sequelize.transaction();
		var user = req.session.user
		var cardSets = await CardSet.findAll({
			raw: true,
			order: [["popularity", "DESC"]],
			include: [{ model: User, attributes: ['user_id'] }],
			transaction: t
		});

		var likedCardSets = [];

		if (req.session.user) {
			likedCardSets = await Liked.findAll({
				where: {
					user_id: req.session.user.user_id
				},
				attributes: [
					"cardSet_id",
				],
				transaction: t,
				raw: true,
			});
		}
		res.render("welcome", { user: user, cardSets: cardSets, likedCardSets: likedCardSets })
		t.commit();

	}
	catch (e) {
		console.log(e);
		t.rollback();
	}

});

app.get("/login", function (req, res) {
	if (req.session.user != null) {
		res.redirect("/welcome");
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
				order: [["cardSet_name", "DESC"]],
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
			res.redirect("/welcome");
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
					res.redirect("/welcome");
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
	if(!req.session.user) {
		res.sendStatus(401);
		return;
	}

	var exists = await CardSet.findOne({
		where: {
			cardSet_name: req.body.title,
			user_id: req.session.user.user_id
		}
	})

	if(exists) { 
		res.sendStatus(400);
		return;
	}

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
		res.render('cardSetPage', { cardSet: cardSet, user: req.session.user })
	}
	catch (e) {
		console.log(e);
	}

})

app.get("/edit-flash/:id", async function (req, res) {
	try {
		//return 401 if user is not logged in
		if (!req.session.user) {
			console.log("Not logged in");
			res.status(401).send();
			return;
		}

		var set = await CardSet.findByPk(req.params.id, {
			include: [
				{
					model: Card,
					as: "Cards"
				}]
		})

		//return 401 if user is not owner of set
		if (set.user_id != req.session.user.user_id) {
			console.log("Not correct user");
			res.status(401).send();
			return;
		}

		res.render("edit-flash", { set: set, user: req.session.user })

	} catch (e) {
		console.log(e);
	}
})

///////
// SQL queries no rendering
//////

// Deletes liked association
app.delete('/api/deleteLike/:id', async (req, res) => {

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

// Deletes a  users card set
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
			res.status(200).send();
		}
		catch (e) {
			console.log(e);
			t.rollback();
			res.status(409).send("Something went wrong when tyring to like this button!");
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

app.patch("/api/editset", async function (req, res) {
	try{

		if(!req.session.user) {
			res.sendStatus(401);
			return;
		}

		var exists = await CardSet.findOne({
			where: {
				cardSet_name: req.body.title,
				user_id: req.session.user.user_id
			}
		})
	
		if(exists) { 
			res.sendStatus(400);
			return;
		}

		var t = await sequelize.transaction();

		//update set
		await CardSet.update({
			cardSet_name: req.body.title,
			cardSet_description: req.body.description
		},
		{
			where: { cardSet_id: req.body.cardSet_id },
			transaction: t
		});

		//create new cards
		if(req.body.create)
			await Card.bulkCreate(req.body.create, {transaction: t});

		//update changed cards
		if(req.body.change){
			for(var card of req.body.change) {
				await Card.update({
					card_front: card.card_front,
					card_back: card.card_back
				},
				{
					where: { card_id: card.card_id },
					transaction: t
				});
			}
		}

		//delete cards
		if(req.body.destroy) {
			for(var id of req.body.destroy) {
				await Card.destroy({ where: { card_id: id }, transaction: t });
			}
		}

		await t.commit();

		res.status(200).send();

	} catch(e) {
		console.log(e);
		if (t)
			await t.rollback();
		return res.status(400).send();
	}
})

// start up the server added dynamic port listening for Heroku
var server = app.listen(process.env.PORT || app.get("port"), function () {
	console.log("Server started...");
});
