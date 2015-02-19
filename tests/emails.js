Tinytest.add('Emails - send - should send using the default action', function (test) {
  Emails.send({
    _id: "test 1"
    , to: "customer@example.com"
    , from: "developer@example.com"
    , subject: "Email test"
    , text: "This is a test."
  });

  var email = _.find(Emails._test_emails, function (a) {
    return a._id == "test 1";
  });

  test.equal(typeof email, "object");
  test.equal(email.text, "This is a test.");
});

Tinytest.add('Emails - route - should create named route', function (test) {
  var routeName = "test 2";
  Emails.route(routeName, {});

  test.equal(typeof Emails.routes[routeName], "object");
});

Tinytest.add('Emails - send - should accept a route name', function (test) {
  var routeName = "test 3";
  Emails.route(routeName, {
    beforeSend: function (email) {
      email._test_field = routeName;
    }
  });

  Emails.send(routeName, {
    to: "customer@example.com"
    , from: "developer@example.com"
    , subject: "Email test"
    , text: "This is a test."
  });

  var email = _.find(Emails._test_emails, function (a) {
    return a._test_field == routeName;
  });

  test.equal(typeof email, "object");
  test.equal(email.text, "This is a test.");
});

Tinytest.add('Emails - extend - should extend an existing route', function (test) {
  var routeName = "test 4";
  Emails.extend("default", routeName, {
    beforeSend: function (email) {
      email._test_field = routeName;
    }
  });

  Emails.send(routeName, {
    to: "customer@example.com"
    , from: "developer@example.com"
    , subject: "Email test"
    , text: "This is a test."
  });

  var email = _.find(Emails._test_emails, function (a) {
    return a._test_field == routeName;
  });

  test.equal(typeof email, "object");
  test.equal(email.text, "This is a test.");
});
