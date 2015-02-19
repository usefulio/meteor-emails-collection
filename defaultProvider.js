Emails.routes.default.action = function (email) {
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
};