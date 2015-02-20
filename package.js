Package.describe({
  summary: "Email queing and reply processing for meteor.",
  version: "0.3.4",
  git: "https://github.com/usefulio/meteor-emails-collection.git",
  name: "cwohlman:emails"
});

// Required to test default provider (Email.send)
Npm.depends({"stream-buffers": "0.2.5"});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.3.1');

  api.use('cwohlman:templating-server@1.0.8_2');
  api.imply('cwohlman:templating-server');

  api.use('underscore');
  api.use('accounts-base');
  api.use('mongo');
  api.use('email');

  api.export('Emails');
  api.export('EmailController');

  api.addFiles('lib/controller.js');
  api.addFiles('lib/emails.js');
  api.addFiles('lib/defaultProvider.js');
  api.addFiles('lib/defaultHelpers.js');
  api.addFiles('lib/defaultHooks.js');
});

Package.onTest(function(api) {
  api.use('underscore');
  api.use('tinytest');
  api.use('accounts-base');
  api.use('cwohlman:emails');
  api.use('email');
  api.use('autopublish');
  
  api.addFiles("tests/mocks.js");

  api.addFiles("test_templates/simple.spacebars");
  api.addFiles("test_templates/layout.spacebars");
  api.addFiles("test_templates/withHelpers.spacebars");
  api.addFiles("test_templates/withHelpers.js");

  api.addFiles("tests/controller.js");
  api.addFiles("tests/emails.js");
  api.addFiles("tests/defaultProvider.js");
  api.addFiles("tests/defaultHelpers.js");
  api.addFiles("tests/defaultHooks.js");
});
