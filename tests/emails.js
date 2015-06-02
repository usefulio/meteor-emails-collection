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

Tinytest.add("Emails - calls before send", function (test) {
  Emails.route('test', {
    beforeSend: function (email) {
      sent = true;
    }
  });

  var sent = false;
  var email = Emails.send('test', {
    to: 'joe@example.com'
    , from: 'admin@example.com'
    , subject: 'test'
    , text: 'this is a test of the cwohlman:emails package'
    , html: '<p>this is a test of the cwohlman:emails package</p>'
  });

  test.equal(sent, true);
  test.equal(email.to, 'joe@example.com');
  test.equal(email.from, 'admin@example.com');
  test.equal(email.subject, 'test');
  test.equal(email.text, 'this is a test of the cwohlman:emails package');
  test.equal(email.html, '<p>this is a test of the cwohlman:emails package</p>');
});

Tinytest.add("Emails - supports overriding fields", function (test) {
  Emails.route('test', {
    subject: function (email) {
      return 'some subject';
    }
    , customField: true
  });

  var email = Emails.send('test', {
    to: 'joe@example.com'
    , from: 'admin@example.com'
    , subject: 'test'
    , text: 'this is a test of the cwohlman:emails package'
    , html: '<p>this is a test of the cwohlman:emails package</p>'
  });

  test.equal(email.to, 'joe@example.com');
  test.equal(email.from, 'admin@example.com');
  test.equal(email.subject, 'some subject');
  test.equal(email.text, 'this is a test of the cwohlman:emails package');
  test.equal(email.html, '<p>this is a test of the cwohlman:emails package</p>');
  test.equal(email.customField, true);
});