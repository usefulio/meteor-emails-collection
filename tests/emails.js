Tinytest.add("Emails - Sends email", function (test) {
  var email = Emails.send({
    to: 'joe@example.com'
    , from: 'admin@example.com'
    , subject: 'test'
    , text: 'this is a test of the cwohlman:emails package'
    , html: '<p>this is a test of the cwohlman:emails package</p>'
  });

  test.equal(email.to, 'joe@example.com');
  test.equal(email.from, 'admin@example.com');
  test.equal(email.subject, 'test');
  test.equal(email.text, 'this is a test of the cwohlman:emails package');
  test.equal(email.html, '<p>this is a test of the cwohlman:emails package</p>');
});