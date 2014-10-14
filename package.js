Package.describe({
  summary: "Email queing and reply processing for meteor.",
  version: "0.0.1",
  git: "",
  name: "cwohlman:emails"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3.1');
  api.use('underscore');
  api.use('email');
  
  api.export('Emails');

  api.addFiles('emails.js');
});

Package.onTest(function(api) {
  api.use('underscore');
  api.use('tinytest');
  api.use('accounts-base');
  api.use('cwohlman:emails');
  api.use('email');
  api.addFiles('emails-tests.js');
});
