Emails.route("provider", {
  action: function (email) {
    Email.send(_.pick(email
      , "from"
      , "to"
      , "cc"
      , "bcc"
      , "replyTo"
      , "subject"
      , "text"
      , "html"
      , "headers")
    );
  }
});

Emails.setDefaultAction("provider");

Emails.route("queue", {
  action: function (email) {
    email.sent = false;

    if (!Emails._collection)
      Emails._collection = new Mongo.Collection('emails');

    Emails._collection.insert(email);
  }
});

Emails.route("userMessage", {
  beforeSend: function (email) {
    email.threadId = this.get("threadId");
    email.replyTo = email.threadId + "@" + this.get("domain");
    email.from = this.get("prettyAddress", "notifications@" + this.get("domain"), this.get("fromUser").profile.name);
  }
});