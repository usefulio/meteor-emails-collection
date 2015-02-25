Emails = {};

Emails.send = function (route, email, context) {
	var self = this;

	if ((typeof route) === "object" && !context) {
		context = email;
		email = route;
		route = null;
	}
	if (!route)
		route = "default";

	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);
	if (typeof email !== "object")
		throw new Error("email should be an object, not " + typeof email);

	var controller = self.routes[route];

	return controller.send(email, context);
};

Emails.routes = {
	"default": new EmailController({
		helpers: {}
	})
};

Emails.route = function (route, controller) {
	var self = this;

	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);
	if (typeof controller !== "object")
		throw new Error("controller should be an object, not " + typeof controller);
	if (self.routes[route])
		throw new Error("route named " + route + " already defined");

	if (! (controller instanceof EmailController))
		controller = self.routes["default"].extend(controller);

	self.routes[route] = controller;
};

Emails.alias = function (route, target) {
	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);
	if (typeof target !== "string")
		throw new Error("target should be a string, not " + typeof target);
	if (route === target)
		throw new Error('May not alias a route to it\'self');

	// XXX prevent circular references
	var aliasRoute = Emails.routes[route];
	if (!aliasRoute)
		throw new Error("route does not exist");

	aliasRoute.aliasFor = target;
	aliasRoute.action = function (email) {
		Emails.send(target, email, this);
	};
};

Emails.extend = function (parent, route, controller) {
	var self = this;

	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);
	if (typeof controller !== "object")
		throw new Error("controller should be an object, not " + typeof controller);
	if (self.routes[route])
		throw new Error("route named " + route + " already defined");

	controller = self.routes[parent].extend(controller);

	self.routes[route] = controller;
};

Emails.setDefaultAction = function (route) {
	Emails.alias("default", route);
};

Emails.setProvider = function (route) {
	Emails.alias("provider", route);
};

Emails._processQueue = function (route, emails) {
	var errors = [];

	_.each(emails, function (email) {
		try {
			Emails.send(route, email);
			Emails._collection.update(email._id, {
				$set: {
					sent: true
				}
			});
		} catch (e) {
			Emails._collection.update(email._id, {
				$set: {
					sent: "failed"
				}
			});
			errors.push(e);
		}
	});

	_.each(errors, function (e) {
		throw e;
	});

	return emails.length;
};

Emails.processQueue = function (route) {
	if (!route)
		route = "provider";
	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);

	if (!Emails._collection)
		return;

	var emails = Emails._collection.find({
		sent: false
	}).fetch();

	return Emails._processQueue(route, emails);
};

Emails.autoProcessQueue = function (route) {
	if (!route)
		route = "provider";
	if (typeof route !== "string")
		throw new Error("route should be a string, not " + typeof route);

	if (!Emails._collection)
		Emails._collection = new Mongo.Collection('emails');

	Emails._observer = Emails._collection.find({
		sent: false
	}).observe({
		added: function (email) {
			Emails._processQueue(route, [email]);
		}
	});
};

Emails.config = function (config) {
	this.routes.default.config = this.routes.default.config || {};
	_.extend(this.routes.default.config, config);
};

// /*
// 	Sample Email:
// 	{
// 		// These fields used by the Email.send method:

// 		from: 'somebody@gmail.com'
// 		, to: 'somebodyelse@gmail.com'
// 		// also allowed:
// 		// , cc, bcc, replyTo
// 		, subject: 'hi there'
// 		, text: 'hows it going'
// 		, html: '<p>hows it going</p>'
// 		// XXX disallow this?
// 		// override it in Emails.config?
// 		, headers: {}

// 		// These fields are used by the email processing system to store
// 		// state information:
		
// 		// sent
// 		, sent: true // this email has been processed and sent
// 		, sent: false // this email has been processed, but was not sent
// 		, sent: 'somelongrandomid' // this email is being processed
// 		, sent: {$exists: false} // this email has not been processed

// 		// draft
// 		, draft: true // this email should not be processed yet

// 		// read
// 		, read: true // the recipient of this email has read the email

// 		// These fields are used by the email processing system to store
// 		// metadata:

// 		, threadId: 'somerandomid'
// 		, fromId: 'someuserid'
// 		, toId: 'someotheruserid'
// 		, original: '{}' // reserved for logging the 'raw' email
// 		, error: '{}' // reserved for logging errors related to this email
// 	}
// */
