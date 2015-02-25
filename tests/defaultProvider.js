if (Meteor.isServer) {
  testAndCleanup("Emails - default provider - sends via email package", function (test) {
    // Copied from meteor/packages/email/email_tests.js
    // https://github.com/meteor/meteor/blob/devel/packages/email/email_tests.js#L10-L35
    // 
    Emails.send({
      from: "foo@example.com",
      to: "bar@example.com",
      cc: ["friends@example.com", "enemies@example.com"],
      subject: "This is the subject",
      text: "This is the body\nof the message\nFrom us.",
      headers: {'X-Meteor-Test': 'a custom header'}
    });
    // XXX brittle if mailcomposer changes header order, etc
    test.equal(stream.getContentsAsString("utf8"),
               "====== BEGIN MAIL #0 ======\n" +
               "(Mail not sent; to enable sending, set the MAIL_URL " +
                 "environment variable.)\n" +
               "MIME-Version: 1.0\r\n" +
               "X-Meteor-Test: a custom header\r\n" +
               "From: foo@example.com\r\n" +
               "To: bar@example.com\r\n" +
               "Cc: friends@example.com, enemies@example.com\r\n" +
               "Subject: This is the subject\r\n" +
               "Content-Type: text/plain; charset=utf-8\r\n" +
               "Content-Transfer-Encoding: quoted-printable\r\n" +
               "\r\n" +
               "This is the body\r\n" +
               "of the message\r\n" +
               "From us.\r\n" +
               "====== END MAIL #0 ======\n");
  });

  testAndCleanup("Emails - default provider - queues emails for sending", function (test) {
    Emails.setDefaultAction("queue");

    Emails.send({
      _test_field: routeName
    });

    sent = Emails._collection.findOne();

    test.equal(typeof sent, 'object');
    test.equal(sent._test_field, routeName);
  });

  testAndCleanup("Emails - default provider - dequeues emails for sending", function (test) {
    Emails.route(routeName, {
      action: function (email) {
        sent = email;
      }
    });

    Emails.setDefaultAction("queue");
    Emails.setProvider(routeName);
    Emails.send({
      _test_field: routeName
    });

    Emails.processQueue();

    test.equal(typeof sent, 'object');
    test.equal(sent._test_field, routeName);
  });

  testAndCleanup("Emails - default provider - auto process queue", function (test, done) {
    Emails.route(routeName, {
      action: function (email) {
        sent = email;
      }
    });

    Emails.autoProcessQueue();

    Emails.setDefaultAction("queue");
    Emails.setProvider(routeName);
    Emails.send({
      _test_field: routeName
    });

    Meteor.setTimeout(function () {
      try {
        test.equal(typeof sent, 'object');
        test.equal(sent._test_field, routeName);
      } catch (e) {
        test.fail(e);
      } finally {
        done();
      }
    }, 5);

  }, 'addAsync');

  testAndCleanup("Emails - default provider - should send user messages", function (test) {
    Emails.routes.default.action = function (email) {
      sent = email;
    };

    Emails.config({
      domain: "m.example.com"
    });

    Emails.send("userMessage", {
      fromId: Meteor.users.findOne({"profile.name": "joe"})._id
      , toId: Meteor.users.findOne({"profile.name": "sam"})._id
    });

    test.equal(typeof sent.threadId, "string");
    test.equal(sent.replyTo, sent.threadId + "@m.example.com");
    test.equal(sent.from, "\"joe\" <notifications@m.example.com>");
  });

  testAndCleanup("Emails - default provider - should mark messages as sent", function (test) {
    Emails.routes.provider.action = function (email) {
      return;
    };

    Emails.setDefaultAction("queue");

    Emails.config({
      domain: "m.example.com"
    });

    Emails.send("userMessage", {
      fromId: Meteor.users.findOne({"profile.name": "joe"})._id
      , toId: Meteor.users.findOne({"profile.name": "sam"})._id
    });

    Emails.processQueue();

    sent = Emails._collection.findOne();

    console.log('sent', sent);

    test.equal(sent.sent, true);
  });

  testAndCleanup("Emails - default provider - should autoProcessQueue", function (test, done) {
    Emails.routes.provider.action = function (email) {
      return;
    };

    Emails.setDefaultAction("queue");

    Emails.autoProcessQueue();

    Emails.config({
      domain: "m.example.com"
    });

    Emails.send("userMessage", {
      fromId: Meteor.users.findOne({"profile.name": "joe"})._id
      , toId: Meteor.users.findOne({"profile.name": "sam"})._id
    });

    Meteor.setTimeout(function () {
      try {
        sent = Emails._collection.findOne();
        test.equal(sent.sent, true);
      } catch (e) {
        test.fail(e);
      } finally {
        done();
      }
    }, 10);
  }, "addAsync");

  testAndCleanup("Emails - default provider - forwards messages to the appropriate user", function (test) {
    Emails.routes.default.action = function (email) {
      sent = email;
    };

    Emails.config({
      domain: "m.example.com"
    });

    var fromId = Meteor.users.findOne({"profile.name": "joe"})._id;
    var toId = Meteor.users.findOne({"profile.name": "sam"})._id;

    Emails.send("userMessage", {
      fromId: fromId
      , toId: toId
      , subject: "Sent"
      , html: "Hi"
    });

    Emails.send("forward", {
      from: sent.to
      , to: sent.replyTo
      , subject: "Re: Sent"
      , html: "Hi"
    });

    test.equal(sent.toId, fromId);
    test.equal(sent.fromId, toId);

    test.equal(typeof sent.threadId, "string");
    test.equal(sent.replyTo, sent.threadId + "@m.example.com");
    test.equal(sent.from, "\"sam\" <notifications@m.example.com>");
  });

  testAndCleanup("Emails - default provider - configureForwarding callback", function (test) {
    var url;

    Emails.routes.default.action = function (email) {
      sent = email;
    };

    Emails.config({
      domain: "m.example.com"
    });

    Emails.configureForwarding(function (request) {
      var recieved = request.body;

      console.log('recieved', recieved);

      Emails.send("forward", {
        from: recieved.to
        , to: recieved.replyTo
        , subject: "Re: Sent"
        , html: "Hi"
      });
    }, function (error, result) {
      url = result;
    });

    var fromId = Meteor.users.findOne({"profile.name": "joe"})._id;
    var toId = Meteor.users.findOne({"profile.name": "sam"})._id;

    Emails.send("userMessage", {
      fromId: fromId
      , toId: toId
      , subject: "Sent"
      , html: "Hi"
    });

    console.log('sent', sent);

    HTTP.post(url, {
      data: sent
    });

    console.log('sent', sent);

    test.equal(sent.toId, fromId);
    test.equal(sent.fromId, toId);

    test.equal(typeof sent.threadId, "string");
    test.equal(sent.replyTo, sent.threadId + "@m.example.com");
    test.equal(sent.from, "\"sam\" <notifications@m.example.com>");
  });
}
