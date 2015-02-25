testAndCleanup("Emails - default hooks - from and to", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.send({
    fromId: Meteor.users.findOne({"profile.name": "joe"})._id
    , toId: Meteor.users.findOne({"profile.name": "sam"})._id
  });

  test.equal(sent.from, "\"joe\" <joe@example.com>");
  test.equal(sent.to, "\"sam\" <sam@example.com>");
});

testAndCleanup("Emails - default hooks - template", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.send({
    template: "simple"
    , message: "test"
  });

  test.equal(sent.html, "<p>test</p>");
});


testAndCleanup("Emails - default hooks - template with layout", function (test) {
  Emails.routes.default.action = function (email) {
    sent = email;
  };

  Emails.send({
    template: "simple",
    layoutTemplate: "layout",
    message: "test"
  });
  
  test.equal(sent.html, "<div><p>test</p></div>");
});