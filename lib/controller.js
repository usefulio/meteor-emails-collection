/**
 * @summary An EmailController represents code that sends emails according
 * to a specific set of options.
 * @instancename controller
 * @param {Object} options An optional object to extend this controller
 */
EmailController = function (options) {
  var self = this;
  if (! (self instanceof EmailController))
    return new EmailController(options);

  self._extend(options);
};

EmailController.prototype._extend = function (options) {
  var self = this;

  _.each(options, function (val, key) {
    if (EmailController._isHook(key)) {
      self.addHook(key, val);
    } else {
      self[key] = val;
    }
  });
};

EmailController._isHook = function (key) {
  return _.contains(EmailController._hooks, key);
};

EmailController._hooks = [
  "beforeSend"
  , "afterSend"
];

EmailController.prototype.addHook = function (name, fn) {
  var self = this;

  if (! EmailController._isHook(name))
    throw new Error(name + " is not a valid hook");

  self[name] = self[name] || [];
  self[name].push(fn);
};

EmailController.prototype.callHook = function (name, context) {
  var self = this;

  if (! EmailController._isHook(name))
    throw new Error(name + " is not a valid hook");

  if (! _.isObject(context))
    throw new Error("context must be an object, not " + (typeof context));

  context.controller = self;

  var hooks = self[name];

  if (_.isArray(hooks)) {
    _.each(hooks, function (hook) {
      hook.call(context, context.email);
    });
  }
};

EmailController.prototype.extend = function (options) {
  var self = this;
  var inherited = {};

  // we can't use _.clone here because we don't want to copy the properties
  // from the prototype
  _.each(self, function (val, key) {
    inherited[key] = val;
  });

  var child = new EmailController();
  _.extend(child, inherited);
  child._extend(options);

  return child;
};

EmailController.prototype.send = function (email, context) {
  var self = this;

  if (typeof email !== "object")
    throw new Error("email should be an object, not " + (typeof email));
  if (!context)
    context = {};
  if (typeof context !== "object")
    throw new Error("context should be an object, not " + (typeof context));

  if (typeof self.action !== "function")
    throw new Error("cannot send email, no action defined");

  context.email = email;

  self.callHook("beforeSend", context);
  self.action.call(context, email);
  self.callHook("afterSend", context);
};
