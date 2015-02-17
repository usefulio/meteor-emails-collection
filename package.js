Package.describe({
  summary: "Email queing and reply processing for meteor.",
  version: "0.3.4",
  git: "https://github.com/usefulio/meteor-emails-collection.git",
  name: "cwohlman:emails"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3.1');

  api.use('cwohlman:templating-server@1.0.8_2');
  api.imply('cwohlman:templating-server');

  api.use('underscore');
  api.use('accounts-base');
  api.use('mongo');

  api.export('Emails');

  api.addFiles('emails.js', ['server']);
  api.addFiles('emailsDefaultProvider.js', ['server']);
});

Package.onTest(function(api) {
  api.use('underscore');
  api.use('tinytest');
  api.use('accounts-base');
  api.use('cwohlman:emails');
  api.use('email');

  api.addFiles('test_templates/simple.spacebars', 'server');
  api.addFiles('test_templates/layout.spacebars', 'server');
  api.addFiles('test_templates/withHelpers.spacebars', 'server');
  api.addFiles('test_templates/withHelpers.js', 'server');
  api.addFiles('emails-tests.js');
});
