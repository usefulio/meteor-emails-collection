if (Meteor.isServer) {
	var emails = [];
	var originalConfig = _.clone(Emails.config);
	var reset = function (config) {
		emails.reset();
		if (Emails._collection) Emails._collection.remove({});
		Emails.initialize(config);
	};
	Emails.provider = emails;
	emails.send = emails.push;
	emails.reset = function () {
		emails.length = 0;
	};
	Meteor.users.remove({});
	var joeBlow = Meteor.users.insert({
		profile: {
			name: 'joe blow'
		}
		, emails: [
			{
				address: 'joeblow@joeblow.com'
			}
		]
	});

	var samBond = Meteor.users.insert({
		profile: {
			name: 'sam bond'
		}
		, emails: [
			{
				address: 'sambond@sambond.com'
			}
		]
	});

	var adminUser = Meteor.users.insert({
		profile: {
			name: 'example site support'
		}
		, emails: [
			{
				address: 'joe@admin.com'
			}
			, {
				address: 'notifications@example.com'
			}
		]
	});

	Tinytest.add('Emails - helpers - getUser returns user record', function (test) {
		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
		});
		test.equal(typeof Emails.getUser, 'function');
		var user = Emails.getUser('user_' + joeBlow + '@example.com');
		test.equal(typeof user, 'object');
		test.equal(user._id, joeBlow);
		test.equal(user.profile.name, 'joe blow');
	});

	Tinytest.add('Emails - helpers - getUser returns undefined', function (test) {
		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
		});
		test.equal(typeof Emails.getUser, 'function');
		var user = Emails.getUser('user_' + 'xxxx' + '@example.com');
		test.equal(user, undefined);
	});

	Tinytest.add('Emails - processor - vanilla', function (test) {
		emails.reset();

		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
		});

		Emails.send({
			fromId: joeBlow
			, toId: samBond
			, text: 'hi there'
			, subject: 'hi there'
		});

		test.equal(emails.length, 1);
		test.equal(emails[0].from, '"joe blow" <user_' + joeBlow + '@example.com>');
		test.equal(emails[0].to, '"sam bond" <sambond@sambond.com>');
		test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
		test.equal(emails[0].subject, 'hi there');
		test.equal(emails[0].text, 'hi there');
		test.equal(emails[0].html, 'hi there');
	});

	Tinytest.add('Emails - processor - cover address', function (test) {
		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			fromId: joeBlow
			, toId: samBond
			, text: 'hi there'
			, subject: 'hi there'
		});

		test.equal(emails.length, 1);
		test.equal(emails[0].from, 'notifications@example.com');
		test.equal(emails[0].replyTo, 'user_' + joeBlow + '@example.com');
		test.equal(emails[0].to, '"sam bond" <sambond@sambond.com>');
		test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
	});

	Tinytest.add('Emails - processor - reply', function (test) {
		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			from: 'sambond@sambond.com'
			, to: 'user_' + joeBlow + '@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		test.equal(emails.length, 1);
		test.equal(emails[0].from, 'notifications@example.com');
		test.equal(emails[0].replyTo, 'user_' + samBond + '@example.com');
		test.equal(emails[0].to, '"joe blow" <joeblow@joeblow.com>');
		test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
		test.equal(emails[0].subject, 'Re: hi there');
		test.equal(emails[0].text, 'hi there');
		test.equal(emails[0].html, '<p>hi there</p>');
	});

	Tinytest.add('Emails - processor - admin reply', function (test) {
		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			from: 'sambond@sambond.com'
			, to: 'notifications@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		test.equal(emails.length, 1);
		test.equal(emails[0].from, 'notifications@example.com');
		test.equal(emails[0].replyTo, 'user_' + samBond + '@example.com');
		test.equal(emails[0].to, '"example site support" <joe@admin.com>');
		test.equal(emails[0].threadId, [samBond, adminUser].sort().join("_"));
		test.equal(emails[0].subject, 'Re: hi there');
		test.equal(emails[0].text, 'hi there');
		test.equal(emails[0].html, '<p>hi there</p>');
	});

	Tinytest.addAsync('Emails - queue - inserts', function (test, next) {
		// reset the Emails collection
		reset({
			queue: true
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			from: 'sambond@sambond.com'
			, to: 'user_' + joeBlow + '@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		var queuedEmails = Emails._collection.find().fetch();

		test.equal(queuedEmails.length, 1);
		test.equal(queuedEmails[0].from, 'notifications@example.com');
		test.equal(queuedEmails[0].replyTo, 'user_' + samBond + '@example.com');
		test.equal(queuedEmails[0].to, '"joe blow" <joeblow@joeblow.com>');
		test.equal(queuedEmails[0].threadId, [samBond, joeBlow].sort().join("_"));
		test.equal(queuedEmails[0].subject, 'Re: hi there');
		test.equal(queuedEmails[0].text, 'hi there');
		test.equal(queuedEmails[0].html, '<p>hi there</p>');

		Meteor.setTimeout(function () {
			test.equal(emails.length, 0);
			next();
		});
	});

	Tinytest.addAsync('Emails - queue - autoprocesses', function (test, next) {
		// reset the Emails collection
		reset({
			queue: true
			, persist: true
			, autoprocess: true
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			from: 'sambond@sambond.com'
			, to: 'user_' + joeBlow + '@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		Meteor.setTimeout(function () {

			var queuedEmails = Emails._collection.find().fetch();

			test.equal(queuedEmails.length, 1);
			test.equal(queuedEmails[0].sent, true);

			test.equal(emails.length, 1);
			test.equal(emails[0].from, 'notifications@example.com');
			test.equal(emails[0].replyTo, 'user_' + samBond + '@example.com');
			test.equal(emails[0].to, '"joe blow" <joeblow@joeblow.com>');
			test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
			test.equal(emails[0].subject, 'Re: hi there');
			test.equal(emails[0].text, 'hi there');
			test.equal(emails[0].html, '<p>hi there</p>');

			next();

		}, 10);
		

	});

	Tinytest.addAsync('Emails - queue - dont persist', function (test, next) {
		// reset the Emails collection
		reset({
			queue: true
			, persist: false
			, autoprocess: true
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		Emails.send({
			from: 'sambond@sambond.com'
			, to: 'user_' + joeBlow + '@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		Meteor.setTimeout(function () {

			var queuedEmails = Emails._collection.find().fetch();

			test.equal(queuedEmails.length, 0);

			test.equal(emails.length, 1);
			test.equal(emails[0].from, 'notifications@example.com');
			test.equal(emails[0].replyTo, 'user_' + samBond + '@example.com');
			test.equal(emails[0].to, '"joe blow" <joeblow@joeblow.com>');
			test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
			test.equal(emails[0].subject, 'Re: hi there');
			test.equal(emails[0].text, 'hi there');
			test.equal(emails[0].html, '<p>hi there</p>');

			next();

		}, 10);
		

	});

	Tinytest.addAsync('Emails - queue - processes only once', function (test, next) {
		// reset the Emails collection
		reset({
			queue: true
			, persist: true
			, autoprocess: true
			, domain: 'example.com'
			, defaultFromAddress: 'notifications@example.com'
		});

		var emailId = Emails.send({
			from: 'sambond@sambond.com'
			, to: 'user_' + joeBlow + '@example.com'
			, text: 'hi there'
			, html: '<p>hi there</p>'
			, subject: 'Re: hi there'
		});

		var email = Emails._collection.findOne(emailId);

		Meteor.setTimeout(function () {Emails.deliver(email);}, 0);
		Meteor.setTimeout(function () {Emails.deliver(email);}, 0);

		Meteor.setTimeout(function () {

			var queuedEmails = Emails._collection.find().fetch();

			test.equal(queuedEmails.length, 1);
			test.equal(queuedEmails[0].sent, true);

			test.equal(emails.length, 1);
			test.equal(emails[0].from, 'notifications@example.com');
			test.equal(emails[0].replyTo, 'user_' + samBond + '@example.com');
			test.equal(emails[0].to, '"joe blow" <joeblow@joeblow.com>');
			test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
			test.equal(emails[0].subject, 'Re: hi there');
			test.equal(emails[0].text, 'hi there');
			test.equal(emails[0].html, '<p>hi there</p>');

			next();

		}, 10);
	});

	Tinytest.add('Emails - processor - uses templates', function (test) {

		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: null
		});

		Emails.send({
			fromId: joeBlow
			, toId: samBond
			, message: 'hi there'
			, subject: 'hi there'
			, template: 'simple'
		});
		// console.log(Template);
		test.equal(emails.length, 1);
		test.equal(emails[0].from, '"joe blow" <user_' + joeBlow + '@example.com>');
		test.equal(emails[0].to, '"sam bond" <sambond@sambond.com>');
		test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
		test.equal(emails[0].subject, 'hi there');
		// XXX
		// test.equal(emails[0].text, 'hi there');
		test.equal(emails[0].html, '<p>hi there</p>');
	});

	Tinytest.add('Emails - processor - templates use helpers', function (test) {

		// reset the Emails collection
		reset({
			queue: false
			, persist: false
			, autoprocess: false
			, domain: 'example.com'
			, defaultFromAddress: null
		});

		Emails.send({
			fromId: joeBlow
			, toId: samBond
			, a: 1
			, b: 1
			, subject: 'hi there'
			, template: 'withHelpers'
		});
		// console.log(Template);
		test.equal(emails.length, 1);
		test.equal(emails[0].from, '"joe blow" <user_' + joeBlow + '@example.com>');
		test.equal(emails[0].to, '"sam bond" <sambond@sambond.com>');
		test.equal(emails[0].threadId, [samBond, joeBlow].sort().join("_"));
		test.equal(emails[0].subject, 'hi there');
		// XXX
		// test.equal(emails[0].text, 'hi there');
		test.equal(emails[0].html, '<p>sum: 2</p>');
	});
}
