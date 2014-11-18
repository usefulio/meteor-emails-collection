Emails.provider = {
  send: function (email) {
    console.log('Email not sent, to enable sending add an email provider package such as cwohlman:mailgun-emails');
    console.log(email);
  }
  , reject: function () {}
};
