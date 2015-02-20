
// Generally speaking there's no reason to allow emails to be sent from the 
// client side, however there's also no reason the controller code shouldn't
// be available in the both folder

Tinytest.add('Emails - controllers - initialize empty controller', function (test) {
  var controller = new EmailController();
  test.equal(controller instanceof EmailController, true);

  controller = EmailController();
  test.equal(controller instanceof EmailController, true);
});

Tinytest.add('Emails - controllers - add hook', function (test) {
  var controller = new EmailController();
  test.equal(typeof controller.addHook, "function");
});

Tinytest.add('Emails - controllers - before send', function (test) {
  var controller = new EmailController();
  
  var email = {};
  var context = {
    email: email
  };
  controller.addHook("beforeSend", function (mail) {
    email.sent = true;
    this.sent = true;

    test.equal(email, mail);
    test.equal(this, context);
  });

  controller.callHook("beforeSend", context);
  test.equal(context.sent, true);
  test.equal(email.sent, true);
});

Tinytest.add('Emails - controllers - inherited hooks are additive', function (test) {
  var parent = new EmailController();
  
  var email = {
    _test_field: ""
  };
  var context = {
    email: email
  };

  var controller = parent.extend({
    beforeSend: function (mail) {
      email._test_field += "child";
    }
  });

  parent.addHook("beforeSend", function (mail) {
    email._test_field += "parent";
  });

  controller.callHook("beforeSend", context);

  test.equal(email._test_field, "parentchild");
});

Tinytest.add('Emails - controllers - child hooks are not run on parent collections', function (test) {
  var parent = new EmailController();
  
  var email = {
    _test_field: ""
  };
  var context = {
    email: email
  };
  parent.addHook("beforeSend", function (mail) {
    email._test_field += "parent";
  });

  var controller = parent.extend({
    beforeSend: function (mail) {
      email._test_field += "child";
    }
  });

  parent.callHook("beforeSend", context);

  test.equal(email._test_field, "parent");
});

Tinytest.add('Emails - controllers - afterSend', function (test) {
  var controller = new EmailController();
  
  var email = {};
  var context = {
    email: email
  };
  controller.addHook("afterSend", function (mail) {
    email.sent = true;
    this.sent = true;

    test.equal(email, mail);
    test.equal(this, context);
  });
  test.equal(_.isArray(controller.afterSend), true);
  test.equal(controller.afterSend.length, 1);

  controller.callHook("afterSend", context);
  test.equal(context.sent, true);
  test.equal(email.sent, true);
});

Tinytest.add('Emails - controllers - beforeProcess', function (test) {
  var parent = new EmailController({
    action: function () {}
  });
  
  parent.addHook("beforeProcess", function (email) {
    email.name += "1";
  });
  parent.addHook("beforeProcess", function (email) {
    email.name += "2";
  });

  var controller = parent.extend({
    beforeProcess: function (email) {
      email.name += "3";
    }
  });

  var email = {
    name: ""
  };

  controller.send(email);

  test.equal(email.name, "321");
});

Tinytest.add('Emails - controllers - hooks run in correct order', function (test) {
  var controller = new EmailController();
  var email;

  controller.addHook("beforeSend", function (email) {
    email.beforeSend = true;
  });
  controller.addHook("afterSend", function (email) {
    test.equal(email.beforeSend, true);
    test.equal(email.action, true);

    email.afterSend = true;
  });
  controller.action = function (mail) {
    mail.action = true;
    email = mail;
  };

  controller.send({});
  test.equal(email.afterSend, true);
});

Tinytest.add('Emails - controllers - constructor accepts options', function (test) {
  var controller = new EmailController({
    beforeSend: function (email) {}
    , name: "name"
  });

  test.equal(_.isArray(controller.beforeSend), true);
  test.equal(controller.beforeSend.length, 1);

  test.equal(controller.name, "name");
});

Tinytest.add('Emails - controllers - extend hooks', function (test) {
  var parent = new EmailController({
    action: function (email) {}
  });
  parent.addHook("beforeSend", function (email) {
    email.parent = true;
    email.name = "parent";
  });

  test.equal(typeof parent.extend, "function");

  var controller = parent.extend({
    beforeSend: function (email) {
      email.name = "name";
    }
    , name: "name"
  });

  var email = {};
  controller.send(email);

  test.equal(email.parent, true);
  test.equal(email.name, "name");
});

Tinytest.add('Emails - controllers - send', function (test) {
  var sent;
  var controller = new EmailController({
    beforeSend: function (email) {
      email.beforeSend = "beforeSend";
      this.other = "other";
    }
    , name: "name"
    , action: function (email) {
      test.equal(email.name, "name");
      test.equal(email.beforeSend, "beforeSend");
      test.equal(email.email, undefined);
      test.equal(this.other, "other");
      test.equal(this.email, email);
      test.equal(this.controller, controller);

      sent = email;
    }
  });
  test.equal(typeof controller.send, "function");

  controller.send({
    name: "name"
  });
  test.equal(typeof sent, "object");
});