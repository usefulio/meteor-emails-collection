Emails.routes.original = Emails.routes.default;

Emails.routes.default = new EmailController({
  action: function (email) {
    Emails._test_emails = Emails._test_emails || [];
    Emails._test_emails.push(email);
  }
});
