EmailController = function (options) {
  var self = this;

  self.extensionFields = (self.extensionFields || []).concat(options.extensionFields || []);

  var extensions = _.pick.apply(_, [options].concat(self.extensionFields));
  _.each(extensions, function (extension, key) {
    if (!_.isArray(extension) && !_.isNull(extension) && !_.isUndefined(extension))
      extension = [extension];
    if (_.isArray(extension))
      self[key] = ([] || self[key]).concat(extension);
  });
  var actions = _.pick.apply(_, [options].concat(self.actionFields));

  var helpers = _.omit.apply(_, [options].concat(self.reservedFields()));

  _.each(actions, function (action, key) {
    check(action, Function);
    self[key] = action;
  });

  _.each(helpers, function (helper, key) {
    self[key] = helper;
  });

  return this;
};

EmailController.prototype.extensionFields = ['actionFields'];

EmailController.prototype.actionFields = ['extend'];

EmailController.prototype.reservedFields = function () {
  var self = this;
  return (self.extensionFields || []).concat(self.actionFields || []);
};

EmailController.prototype.extend = function (options) {
  return EmailController.call(new EmailController(this), options);
};