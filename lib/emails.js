Emails = new EmailController({
  send: function (name, email) {
    var self = this;

    if (!email) {
      email = name;
      name = null;
    }

    if (name)
      return this.controllers[name].send(email);

    _.each(_.difference(_.keys(this), this.reservedFields()), function (field) {
      var val = self[field];
      
      if (_.isFunction(val))
        email[field] = val.call(this, val, email);
      else
        email[field] = val;
    });

    _.each(this.beforeSend, function (fn) {
      check(fn, Function);
      fn.call(this, email);
    });
    
    this.action(email);

    _.each(this.afterSend, function (fn) {
      check(fn, Function);
      fn.call(this, email);
    });

    return email;
  }
  , action: function (email) {
    if (this.queue) {
      this.collection.insert(email);
    } else {
      this.providerSend(email);
    }
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
    return email;
  }
  , route: function (name, options) {
    this.controllers = this.controllers || {};
    this.controllers[name] = this.extend(options);
  }
  , actionFields: ['send', 'providerSend', 'route', 'action', 'queue', 'collection']
  , extensionFields: ['beforeSend', 'afterSend']
});