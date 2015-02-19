Tinytest.add('Emails - send - should send using the default action', function (test) {
  Emails.send({
    _id: "test 1"
    , to: "customer@example.com"
    , from: "developer@example.com"
    , subject: "Email test"
    , text: "This is a test."
  });

  var email = _.find(Emails._test_emails, function (a) {
    return a._id == "test 1";
  });

  test.equal(typeof email, "object");
  test.equal(email.text, "This is a test.");
});