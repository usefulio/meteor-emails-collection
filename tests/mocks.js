if (Meteor.isServer) {
  Meteor.users.remove({});

  Meteor.users.insert({
    profile: {
      name: "joe"
    }
    , emails: [
      {
        address: "joe@example.com"
      }
    ]
  });
  Meteor.users.insert({
    profile: {
      name: "sam"
    }
    , emails: [
      {
        address: "sam@example.com"
      }
    ]
  });
}