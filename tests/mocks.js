Emails.routes.default.action = function (email) {
  Emails._test_emails = Emails._test_emails || [];
  Emails._test_emails.push(email);
};