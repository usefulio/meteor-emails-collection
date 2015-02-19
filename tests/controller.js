
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
  test.equal(_.isArray(controller.beforeSend), true);
  test.equal(controller.beforeSend.length, 1);

  controller.callHook("beforeSend", context);
  test.equal(context.sent, true);
  test.equal(email.sent, true);
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
  var parent = new EmailController();
  parent.addHook("beforeSend", function (email) {
    email.parent = true;
  });
  parent.name = "parent";
  parent.other = "other";

  test.equal(typeof parent.extend, "function");

  var controller = parent.extend({
    beforeSend: function (email) {}
    , name: "name"
  });

  test.equal(_.isArray(controller.beforeSend), true);
  test.equal(controller.beforeSend.length, 2);

  test.equal(controller.name, "name");
  test.equal(controller.other, "other");
});