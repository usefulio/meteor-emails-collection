// Write your package code here!

Emails = {};

Emails.config = {
	// boolean - whether or not to place the messages in a queue before sending them
	queue: false
	// boolean - whether or not to leave/insert messages in the emails collection after sending them
	// if false will delete messages which have been sent
	// if true will upsert messages which have been sent
	, persist: true
	// boolean - whether to observe the emails collection and automatically process/send
	// emails as they are added.
	// also causes the queue to be processed on startup.
	, autoprocess: false
	, collectionName: 'emails'
};

Emails.initialize = function (config) {
	// allow lazy initialization.
	if (!config && Emails._collection) return;

	// override defaults with specified config
	_.extend(Emails.config, config);

	// initialize emails collection
	Emails._collection = Emails._collection || new Meteor.Collection(Emails.config.collectionName);

	if (Emails._observer) Emails._observer.stop();

	// initialize auto-process code
	if (Emails.config.autoprocess) {
		Emails._observer = Emails._collection.find({
			sent: {
				$exists: false
			}
			, draft: {
				$exists: false
			}
		}).observe({
			added: Emails.deliver
			, changed: Emails.deliver
		});
	}
};

Emails.send = function (email) {
	Emails.initialize();
	// preprocesses a message and then either queues or immediately sends it
	// depending on the queue config option.
	email = Emails.process(email);

	if (Emails.config.queue) {
		return Emails.enqueue(email);
	} else {
		return Emails.deliver(email);
	}
};

Emails.process = function (email) {
	// pre-processes an email for enquement or delivery

	// create the cache or context object.
	var cache = {};

	// dont polute the object we were passed.
	email = _.clone(email);

	Emails.getMetadata(email, cache);

	// populate user ids
	if (!email.fromId) email.fromId = Emails.getFromId(email, cache);
	if (!email.toId) email.toId = Emails.getToId(email, cache);

	// populate to and from email addresses
	email.from = Emails.getFromAddress(email.fromId, email, cache);
	email.to = Emails.getToAddress(email.toId, email, cache);
	email.replyTo = Emails.getReplyTo(email.fromId, email, cache);

	// populate threadId and message body
	if (!email.threadId) email.threadId = Emails.getThreadId(email, cache);
	if (!email.text) email.text = Emails.getText(email, cache);
	if (!email.html) email.html = Emails.getHtml(email, cache);

	// allow developer to specify any final transformations
	Emails.preProcess(email, cache);

	return email;
};

Emails.enqueue = function (email) {
	// inserts an email into the queue
	return Emails._collection.insert(email);
};

Emails.deliver = function (email) {
	// actually sends an email
	if (email._id) {
		var marker = Random.id();
		Emails._collection.update({
			_id: email._id
			, sent: {
				$exists: false
			}
		}, {
			$set: {
				sent: marker
			}
		});
		email = Emails._collection.findOne({
			sent: marker
		});
		if (!email) {
			return null;
		}
	}

	// XXX use _.pick to whitelist fields to pass to email.send
	Email.send(email);

	if (email._id) {
		if (Emails.config.persist) {
			Emails._collection.update(email._id, {$set:{sent: true}});
		} else {
			Emails._collection.remove(email._id);
		}
	}

	return email._id;
};

// Preprocessor helpers
// should be in the format function (arg, email)

Emails.getUser = function (emailAddress, email, cache) {
	// returns a userId by processing an email address.
	var query = {
		"emails.address": emailAddress
	};
	if (emailAddress.indexOf('@' + Emails.config.domain) != -1) {
		var username = emailAddress.slice(0, emailAddress.indexOf('@'));
		var userId = _.last(username.split('_'));
		query = {
			$or: [
				query
				, {
					_id: userId
				}
			]
		};
	}
	return Meteor.users.findOne(query);
};

Emails.getFromAddress = function (userId, email, cache) {
	return 'user_' + userId + '@' + Emails.config.domain;
};

Emails.getToAddress = function (userId, email, cache) {
	cache.toUser = cache.toUser || Meteor.users.findOne(userId);
	return (cache.toUser && cache.toUser.emails && cache.toUser.emails[0] || {}).address;
};

Emails.getPrettyAddress = function (address, name, email, cache) {
	if (name) {
		return '"' + name.replace(/[^a-z0-9!#$%&'*+\-\/=?\^_`{|}~ ]/ig, "") + '" <' + address + '>';
	} else {
		return address;
	}
};

Emails.prettifyAddresses = function (email, cache) {
	if (Emails.config.defaultFromAddress && email.replyTo) {
		email.from = Emails.config.defaultFromAddress;
	} else if (cache.fromUser) {
		email.from = Emails.getPrettyAddress(email.from, cache.fromUser.profile.name);
	}
	if (cache.toUser) {
		email.to = Emails.getPrettyAddress(email.to, cache.toUser.profile.name);
	}
};

// Pre-processers
// these processors are run in the order listed
// should be in the format: function (email, cache) where
// email is the email object to be stored/sent
// cache is an object which passes/returns metadata we don't need to
//       store on the email record, for example {fromUser: Users.findOne(fromId)}

// getMetadata and preProcess should be app defined and will always be run
// each of the other functions will be run only if the corrosponding property is missing

Emails.getMetadata = function (email, cache) {
	// sets any app defined properties which should be stored on the email record
	// and available to other preprocessors
	cache.fromUser = email.fromId && Meteor.users.findOne(email.fromId);
	cache.toUser = email.toId && Meteor.users.findOne(email.toId);
};

Emails.getFromId = function (email, cache) {
	// sets the fromId of an email
	var user = Emails.getUser(email.from, email, cache);
	if (user) {
		cache.fromUser = user;
		return user._id;
	} else {
		return null;
	}
};

Emails.getToId = function (email, cache) {
	// sets the toId of an email
	var user = Emails.getUser(email.to, email, cache);
	if (user) {
		cache.toUser = user;
		return user._id;
	} else {
		return null;
	}
};

Emails.getReplyTo = function (fromId, email, cache) {
	// sets the replyTo of an outgoing email
	return Emails.getFromAddress(fromId, email, cache);
};

Emails.getThreadId = function(email, cache) {
	return [email.fromId, email.toId].sort().join("_");
};

Emails.getText = function (email, cache) {
	// sets the plain text email copy
	return '';
};

Emails.getHtml = function (email, cache) {
	// sets the html email copy
	return email.text.split('\n').join('<br>\n');
};

Emails.preProcess = function (email, cache) {
	// user defined method to do any processing of the email which needs to happen after the email
	// processing logic is finished.
	Emails.prettifyAddresses(email, cache);
};

/*
	Sample Email:
	{
		// These fields used by the Email.send method:

		from: 'somebody@gmail.com'
		, to: 'somebodyelse@gmail.com'
		// also allowed:
		// , cc, bcc, replyTo
		, subject: 'hi there'
		, text: 'hows it going'
		, html: '<p>hows it going</p>'
		// XXX disallow this?
		// override it in Emails.config?
		, headers: {}

		// These fields are used by the email processing system to store
		// state information:
		
		// sent
		, sent: true // this email has been processed and sent
		, sent: false // this email has been processed, but was not sent
		, sent: 'somelongrandomid' // this email is being processed
		, sent: {$exists: false} // this email has not been processed

		// draft
		, draft: true // this email should not be processed yet

		// read
		, read: true // the recipient of this email has read the email

		// These fields are used by the email processing system to store
		// metadata:

		, threadId: 'somerandomid'
		, fromId: 'someuserid'
		, toId: 'someotheruserid'
		, original: '{}' // reserved for logging the 'raw' email
		, error: '{}' // reserved for logging errors related to this email
	}
*/
