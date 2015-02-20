Emails.routes.default.helpers.toUser = function () {
  return (this.toUser = Meteor.users.findOne(this.email.toId));
};

Emails.routes.default.helpers.fromUser = function () {
  return (this.fromUser = Meteor.users.findOne(this.email.fromId));
};