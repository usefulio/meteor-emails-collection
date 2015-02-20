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
  return _.contains(_.keys(EmailController._hooks), key);
};

EmailController._hooks = {
  "beforeSend": 1
  , "afterSend": 1
  , "beforeProcess": -1
};

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

  var parent = self.parent;
  var hooks = self[name] || [];

  while (parent) {
    console.log('p', parent);
    if (_.isArray(parent[name]))
      hooks = parent[name].concat(hooks);

    parent = parent.parent;
  }

  if (EmailController._hooks[name] === -1) {
    hooks = hooks.concat().reverse();
  }

  if (_.isArray(hooks)) {
    _.each(hooks, function (hook) {
      hook.call(context, context.email);
    });
  }
};

EmailController.prototype.extend = function (options) {
  options.parent = this;

  return new EmailController(options);
};

EmailController.prototype.send = function (email, context) {
  var self = this;

  if (typeof email !== "object")
    throw new Error("email should be an object, not " + (typeof email));
  if (!context)
    context = {};
  if (typeof context !== "object")
    throw new Error("context should be an object, not " + (typeof context));

  var action = self.action;
  var parent = self.parent;
  while (!action && parent) {
    action = parent.action;
    parent = parent.parent;
  }

  if (typeof action !== "function")
    throw new Error("cannot send email, no action defined");
  
  context.email = email;
  context.controller = self;
  context.get = function (name /*, args...*/) {
    var args = _.toArray(arguments);
    args.unshift(context);
    return self.get.apply(self, args);
  };

  self.callHook("beforeProcess", context);
  self.callHook("beforeSend", context);
  action.call(context, email);
  self.callHook("afterSend", context);
};

EmailController.prototype.get = function (context, name /*, args */) {
  var self = this;
  var args = _.toArray(arguments).slice(1);
  var parent = self;
  var helper;
  var config;

  while (!helper && parent) {
    if (!helper && parent.helpers)
      helper = parent.helpers[name];
    if (!config && parent.config)
      config = parent.config[name];

    parent = parent.parent;
  }
  if (helper)
    return helper.apply(context, args);
  if (config)
    return config;
};

