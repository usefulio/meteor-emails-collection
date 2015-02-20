Emails.routes.default.helpers.toUser = function () {
  return (this.toUser = Meteor.users.findOne(this.email.toId));
};

Emails.routes.default.helpers.fromUser = function () {
  return (this.fromUser = Meteor.users.findOne(this.email.fromId));
};

Emails.routes.default.helpers.prettyAddress = function (address, name) {
 if (_.isString(name)) {
   return '"' + name.replace(/[^a-z0-9!#$%&'*+\-\/=?\^_`{|}~ ]/ig, "") + '" <' + address + '>';
 } else {
   return address;
 }
};