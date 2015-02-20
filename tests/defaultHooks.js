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