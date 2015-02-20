Emails.routes.default.helpers.toUser = function () {
  return Meteor.users.findOne(this.email.toId);
};

Emails.routes.default.helpers.fromUser = function () {
  return Meteor.users.findOne(this.email.fromId);
};