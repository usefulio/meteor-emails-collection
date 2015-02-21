Emails.routes.default.helpers.toUser = function () {
  return (this.toUser = Meteor.users.findOne(this.email.toId));
};

Emails.routes.default.helpers.fromUser = function () {
  return (this.fromUser = Meteor.users.findOne(this.email.fromId));
};

Emails.routes.default.helpers.threadId = function () {
  return "" + this.email.fromId + this.email.toId;
};

Emails.routes.default.helpers.address = function (user) {
  if (!user || !user.emails || !user.emails.length)
    return;

  var address = user.emails[0].address;
  if (!address)
    return;

  var name = user && user.profile && user.profile.name;

  return this.get('prettyAddress', address, name);
};

// XXX getEmail
// XXX getName

Emails.routes.default.helpers.prettyAddress = function (address, name) {
 if (_.isString(name)) {
   return '"' + name.replace(/[^a-z0-9!#$%&'*+\-\/=?\^_`{|}~ ]/ig, "") + '" <' + address + '>';
 } else {
   return address;
 }
};

Emails.routes.default.helpers.render = function (template, layoutTemplate) {
  if (!template)
    throw new Error("template is required");
  if (_.isString(template))
    template = Template[template];
  if (_.isString(layoutTemplate))
    layoutTemplate = Template[layoutTemplate];

   var data  = _.extend({}, this.email, this);

   if (layoutTemplate) {
     layoutTemplate.helpers({
       yield: function () {
         return template;
       }
     });
     return Blaze.toHTMLWithData(layoutTemplate, data);
   } else {
     return Blaze.toHTMLWithData(template, data);
   }

};