Emails.routes.default.addHook("beforeProcess", function (email) {
  if (!email.from && email.fromId)
    email.from = this.get("address", this.get('fromUser'));
  if (!email.to && email.toId)
    email.to = this.get("address", this.get('toUser'));
  if (!email.html && email.template)
    email.html = this.get("render", email.template, email.layoutTemplate);
});