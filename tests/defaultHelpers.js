testAndCleanup("Emails - default helpers - fromUser and toUser", function (test) {
  Emails.routes.default.action = function (email) {
    var from = this.get('fromUser');
    var to = this.get('toUser');

    test.equal(from && from.profile.name, "joe");
    test.equal(to && to.profile.name, "sam");

    sent = email;
  };

  Emails.send({
    fromId: Meteor.users.findOne({"profile.name": "joe"})._id
    , toId: Meteor.users.findOne({"profile.name": "sam"})._id
  });
});