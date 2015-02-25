Super Awesome Meteor Emails
===================

Proposed Api
-------------------

1. `EmailController = `

    ```javascript
    {
        hooks: ["beforeSend", "afterSend", "beforeProcess"] // Array of strings, each string is the name of a property which should be treated as a hook.
        , providerFields: [] // Array of strings, each string is the name of a property which should be sent to the email service
        , collectionFields: [] // Array of strings, each string is the name of a property which should be saved in the emails collection
        , overrides: {} // Object who's properties are functions which should be called to override the value of a

        // helpers/properties

        // prototype
        , send: function (email) {
            _.omit(email, this.hooks);
            _.defaults(email, this);

            // call before process hooks
            var toSend = {};
            _.each(this.providerFields, function (key) {
                var val = email[key];
                if (_.isFunction(val))
                    toSend[key] = val.call(email);
                else
                    toSend[key] = val;
            }, this);
            _.each(this.overrides, function (val, key) {
                if (_.isFunction(val))
                    toSend[key] = val.call(email, toSend[key]);
                else
                    toSend[key] = val;
            }, this);

            // call before send hooks
            email.action(toSend)

            // call after send hooks
            return toSend;
        }
        , extend: function (route) {
            // properly deal with hooks, overrides etc.
            return _.defaults(route, this);
        }
    }
    ```

2. `Emails._controller = new EmailController`

    ```javascript
    ({
        overrides: {
            to: prettyPrintAddress
            , from: prettyPrintAddress
            , replyTo: prettyPrintAddress
            , cc: prettyPrintAddress
            , bcc: prettyPrintAddress
        }
        , html: function () {
            return Blaze.toHTMLWithData(this.template, this);
        }
        , providerFields: [
              "to"
            , "from"
            , "cc"
            , "bcc"
            , "replyTo"
            , "subject"
            , "text"
            , "html"
        ]
        , action: function (email) {
            if (this.queue)
                this.collection.insert(email);
            else
                this.provider.send(email);
        }
    })
    ```

3. `Emails =`

    ```javascript
    {
        route: function (name, options) {
            this.routes[name] = this._controller.extend(options);
        }
        , send: function (name, options) {
            this.routes[name].send(options);
        }
        , config: function (options) {
            // we need to properly deal with hooks, etc.
            _.extend(this._controller, options);
        }
    }
    ```
