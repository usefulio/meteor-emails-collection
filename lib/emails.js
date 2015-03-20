Emails = new EmailController({
  send: function (email) {
    
    this.providerSend(email);

    return email;
  }
  , providerSend: function (email) {
    console.log('======== Begin Email =========');
    _.each([
      'to'
      , 'from'
      , 'subject'
      , 'text'
      , 'html'
    ], function (key) {
      console.log(key, email[key]);
    });
    console.log('======== End Email ===========');
  }
  , actionFields: ['send', 'providerSend']
});