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
}
