Tinytest.add("Emails - Controller - extends self", function (test) {
  var controller = new EmailController({
    test: 5
  });

  test.equal(controller.test, 5);
});