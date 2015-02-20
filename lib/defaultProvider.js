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

    if (!Emails._collection)
      Emails._collection = new Mongo.Collection('emails');

    Emails._collection.insert(email);
  }
});