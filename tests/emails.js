var routeNumber = 1;
var routeName;
var streamBuffers = Npm.require('stream-buffers');
var stream;
var sent;

var testAndCleanup = function (name, fn) {
  Tinytest.add(name, function (test) {
    var originalRoutes = Emails.routes;
    var originalAction = Emails.routes.default.action;
    var originalBeforeSend = Emails.routes.default.beforeSend;
    var originalAfterSend = Emails.routes.default.afterSend;

    Emails.routes = _.clone(originalRoutes);
    Emails.routes.default.beforeSend = [];
    Emails.routes.default.afterSend = [];

    try {
      routeName = "test" + (routeNumber++);
      stream = new streamBuffers.WritableStreamBuffer();
      EmailTest.overrideOutputStream(stream);

      fn(test);
    } finally {
      sent = undefined;
      Emails.routes = originalRoutes;
      Emails.routes.default.action = originalAction;
      Emails.routes.default.beforeSend = originalBeforeSend;
      Emails.routes.default.afterSend = originalAfterSend;

      EmailTest.restoreOutputStream();
    }
  });
};

testAndCleanup("Emails - send - should send using the default action", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.send({
    _test_field: routeName
  });

  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - send - should send using inherited route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.route(routeName, {});

  Emails.send(routeName, {
    _test_field: routeName
  });

  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - send - should call beforeSend of inherited route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.route(routeName, {
    beforeSend: function (email) {
      email._test_field = routeName;
    }
  });

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

// XXX order of default.addHook and Emails.route should not matter
testAndCleanup("Emails - send - should call beforeSend of default route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.routes.default.addHook("beforeSend", function (email) {
    email._test_field = routeName;
  });

  Emails.route(routeName, {});

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - send - should call afterSend of inherited route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.route(routeName, {
    afterSend: function (email) {
      email._test_field = routeName;
    }
  });

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

// XXX order of default.addHook and Emails.route should not matter
testAndCleanup("Emails - send - should call afterSend of default route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.routes.default.addHook("afterSend", function (email) {
    email._test_field = routeName;
  });

  Emails.route(routeName, {});

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - extend - should inherit from named route", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.extend("default", routeName, {
    afterSend: function (email) {
      email._test_field = routeName;
    }
  });

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - route - should allow us to create base level routes", function (test) {
  Emails.route(routeName, new EmailController({
    afterSend: function (email) {
      email._test_field = routeName;
    },
    action: function (email) {
      sent = email;
    }
  }));

  Emails.send(routeName, {});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

testAndCleanup("Emails - setDefaultAction - should allow us to override the default action", function (test) {
  Emails.route(routeName, new EmailController({
    afterSend: function (email) {
      email._test_field = routeName;
    },
    action: function (email) {
      sent = email;
    }
  }));

  Emails.setDefaultAction(routeName);

  Emails.send({});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});

// XXX should allow us to specify a function as the default action

testAndCleanup("Emails - setProvider - should allow us to override the default provider", function (test) {
  Emails.route(routeName, new EmailController({
    afterSend: function (email) {
      email._test_field = routeName;
    },
    action: function (email) {
      sent = email;
    }
  }));

  Emails.setProvider(routeName);

  Emails.send({});
  
  test.equal(typeof sent, 'object');
  test.equal(sent._test_field, routeName);
});