var routeNumber = 1;

Tinytest.add('Emails - send - should send using the default action', function (test) {
  var routeName = "test" + (routeNumber++);
  Emails.send({
    _id: routeName
    , to: "customer@example.com"
    , from: "developer@example.com"
    , subject: "Email test"
    , text: "This is a test."
  });

  var email = _.find(Emails._test_emails, function (a) {
    return a._id == routeName;
  });

  test.equal(typeof email, "object");
  test.equal(email.text, "This is a test.");

  delete Emails.routes[routeName];
});

Tinytest.add('Emails - route - should create named route', function (test) {
  var routeName = "test" + (routeNumber++);
  Emails.route(routeName, {});

  test.equal(typeof Emails.routes[routeName], "object");

  delete Emails.routes[routeName];
});

Tinytest.add('Emails - send - should accept a route name', function (test) {
  var routeName = "test" + (routeNumber++);
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

  delete Emails.routes[routeName];
});

Tinytest.add('Emails - extend - should extend an existing route', function (test) {
  var routeName = "test" + (routeNumber++);
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

  delete Emails.routes[routeName];
});

Tinytest.add('Emails - setDefaultAction - should set the default route to send to the specified route', function (test) {
  var routeName = "test" + (routeNumber++);
  Emails.route(routeName, {
    action: function (email) {
      email._test_field = routeName;
      defaultAction(email);
    }
  });

  var defaultAction = Emails.routes.default.action;

  Emails.setDefaultAction(routeName);

  try {
    Emails.send("default", {
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
  } finally {
    Emails.routes.default.action = defaultAction;
  }

  delete Emails.routes[routeName];
});
