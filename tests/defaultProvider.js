if (Meteor.isServer) {
  Tinytest.add('Emails - default provider - should send using the default action', function (test) {
    
    // mocks.js replaces default with original.
    Emails.send("provider", {
      _id: "test 1"
      , to: "customer@example.com"
      , from: "developer@example.com"
      , subject: "Email test"
      , text: "This is a test."
    });
  });  
}
