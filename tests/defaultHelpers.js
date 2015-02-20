testAndCleanup("Emails - default helpers - fromUser and toUser", function (test) {
  Emails.routes.default.action = function (email) {
    var from = this.get('fromUser');
    var to = this.get('toUser');

    test.equal(from && from.profile.name, "joe");
    test.equal(to && to.profile.name, "sam");

    test.equal(this.fromUser, from);
    test.equal(this.toUser, to);

    sent = email;
  };

  Emails.send({
    fromId: Meteor.users.findOne({"profile.name": "joe"})._id
    , toId: Meteor.users.findOne({"profile.name": "sam"})._id
  });
});

testAndCleanup("Emails - default helpers - prettyAddress", function (test) {
  Emails.routes.default.action = function (email) {
    test.equal(this.get("prettyAddress", "joe@example.com", "Joe Schmuc"), "\"Joe Schmuc\" <joe@example.com>");

    sent = email;
  };

  Emails.send({}); 
});

testAndCleanup("Emails - default helpers - render", function (test) {
  Emails.routes.default.action = function (email) {
    this.message = "test";

    var renderedHtml = this.get("render", email.template);

    test.matches(renderedHtml, /test/);

    sent = email;
  };

  Emails.send({
    template: "simple"
  }); 
});

