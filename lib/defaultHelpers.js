Emails.routes.default.helpers.toUser = function () {
  return (this.toUser = Meteor.users.findOne(this.email.toId));
};

Emails.routes.default.helpers.fromUser = function () {
  return (this.fromUser = Meteor.users.findOne(this.email.fromId));
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