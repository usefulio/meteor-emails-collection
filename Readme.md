Supercharged Email Sending System
======================

How to use
---------------------
Install the package in your app:

    meteor add cwohlman:emails

Send emails

    Emails.send({
        to: "joe@example.com"
        , from: "sam@example.com"
        , subject: "Hi"
        , text: "Hi Joe"
    });

Define a custom template

    // server/hello.spacebars
    <template name="hello">
        Hi {{toUser.profile.name}},<br>
        Welcome to our app!<br>
    </template>

Send email using your template

    Emails.send({
        toId: "123"
        , from: "support@example.com"
        , subject: "Welcome"
        , template: "hello" // Template.hello also works
    });

Send an user to user email with built in user messaging system

    Emails.send("userMessage", {
        toId: "123"
        , fromId: "456"
        , subject: "Hi Joe"
        , message: "Hello"
    });

Features
----------------------
1. Unified interface for different email providers
2. Simple api for manipulating email metadata and running before and after hooks
3. Optional queue to defer message sending (for example to a dedicated services app)
6. Define multiple email 'routes' to handle different use cases in your app.
5. Use spacebars templates to compose your emails
8. Support for layout templates so you can wrap all of your emails an consistent ui

TODO
----------------------
4. Built in support for forwarding messages between users of your app without exposing user email addresses
7. Support for markdown in your emails

Api
----------------------
- `Emails.send(email)` - Send an email using the default route and provider, takes an object with the same form as Meteor's `Email.send`.
- `Emails.send(route, email)` - Send an email using the specified route. A route defines custom hooks which run before and after actually sending the email and optionally a custom action to actually send the email.
- `Emails.route(route, options)` - Define a route for sending email which inherits from the default route, `route` is the name of the route, `options` is an object with the following properties (all optional):
    + `beforeSend` - a function, to be called before sending the email.
    + `afterSend` - a function, to be called after sending the email.
    + `action` - a function, called instead of the default action.
- `Emails.route(route, controller)` - Define a route for sending email which does not inherit from the default route, `controller` is an instance of `EmailController`.
- `Emails.extend(parent, route, options)` - Define a route which inherits from another route. `parent` is the name of the route to inherit from, `route` and `options` are the same as `Emails.route`.
- `Emails.setDefaultAction(route)` - Sets a route as the default action, `controller.send(email)` will be called for the route with the name `route`.
- `Emails.setProvider(route)` - Sets `route` as the email provider so that the route's `controller.send` method will be called when sending emails.
- `Emails.processQueue(route)` - Process emails from the queue using `route`, `route` is optional and defaults to `provider`.
- `Emails.autoProcessQueue(route)` - Watch the emails collection and process emails as they are added to the queue. Takes the same arguments as `Emails.processQueue`.
- `Emails.configureForwarding(handler, callback)` - Setup an iron router route to accept callbacks from a mail server and forward them on to the appropriate user.
    + `handler` is called when we recieve a request from the mail server, you'll need to parse the request and call `Emails.send('forward', email)` with any applicable emails to forward.
    + `callback(error, url)` is a node.js style callback who's result argument is the url the mail server should forward mail to.
    + If meteor is serving from localhost or 127.0.0.1 this method is a noop

Controllers
----------------------
Email routes are defined using controllers `new EmailController(options)` you can explicitly create controllers, or let Emails auto create them when you call `Emails.route`.

- `new EmailController(options)` - Construct a new controller, options is an object with the following keys
    + `action` - A function called to 'send' an email, but may actually perform some other action, e.g. queue the email. This function is called after the 'beforeSend' hooks, and before the 'afterSend' hooks.
    + `beforeSend` - A hook to be called before the action for this controller is called.
    + `afterSend` - A hook to be called after the action for this controller has completed.
    + `beforeProcessing` - A hook to be called before the send action and before the 'beforeSend' hook, this hook is run in reverse order, the last callback to be added to the beforeProcessingCallbacks list is called first.
    + `helpers` - An object with various helpers to make available to your email processing logic.
    + `config` - An object with various properties which relate to processing emails, e.g. email domain name.
- `controller.send(email, context)` - Sends an email using this controller's action, calling appropriate hooks.
    + `email` is the email to send.
    + `context` is an object with other helpful values to make available to your email processing logic.
- `controller.extend(options)` - Construct a controller which inherits from this controller and extend it with `options`, options takes the same parameters as `new EmailController` but inherits callbacks(, helpers) and the action (if not overridden) from the base controller.
- Future Api ------
- `controller.onBeforeSend(fn)` - Add another before send hook to an existing controller
- `controller.onAfterSend(fn)`
- `controller.onBeforeProcessing(fn)`
- `controller.helpers(helpersObject)` - Add additional helpers to make them available to your email processing logic.

Callbacks
--------------------
All email processing callbacks are called with a context object as `this` and the email object as the first parameter.

For simple callbacks just use the first parameter for easy access to the email, e.g. `function (email) { email.wasProcessed = true; }`.

For complex callbacks use the `this` context to access other properties e.g.

```
function () {
    var email = this.email; // The email being processed, same as the first argument.
    var controller = this.controller; // The controller processing this email
    var name = this.get('name', email.toId); // example of a helper
}
```

Config
----------------------
- To set the default provider for sending emails use `Emails.setProvider('someProvider')`
- To set the Emails package to queue messages instead of sending them call `Emails.setDefaultAction('queue')`
- To explicitly set the Emails package to send messages immediately (using the default provider) call `Emails.setDefaultAction('provider')`
- To set misc config properties call `Emails.config(options)`, or to set config properties only for specific routes, call `controller.config`.

Built In Routes
----------------------
- `default` - If you call `Emails.send` without a route parameter this is the route which will be called, also if you call `Emails.route` this is the route from which the newly created route will inherit
- `provider` - This is the default provider, the default send action is `provider` and if you use an email queue, the default dequeue action is `provider`. Use `Emails.setProvider` to replace the default provider for sending emails using a mail api, leave this provider in place to use Meteor's built in Email package for sending email.
- `queue` - This route will queue emails in a collection instead of sending them immediately. Use `Emails.setDefaultAction('queue')` to call this route by default instead of the `provider` route.
- `forward` - This route will accept emails from your mail api and deturmine who to send mail to.

Built In Helpers
----------------------
The emails package comes with some built in helpers to make it easier to write templates and email processing logic.

`toUser` - returns `Meteor.users.findOne(email.toId)`
`fromUser` - returns `Meteor.users.findOne(email.fromId)`
`address` - takes a userId and returns a string in the format `First Last <email@example.com>`
`threadId` - returns a 'threadId' which uniquely identifies this conversation.

If you don't need/want these helpers you can override some or all of them by setting the default helpers host, for example:

    // Override a single helper
    Emails.routes.default.helpers.fromUser = function () { return null };

    // Override all helpers
    Emails.routes.default.helpers = {
        test: function () {
            return 1;
        }
    }

Built In Hooks
----------------------
By default the emails package runs limited logic for you as part of a beforeProcess hook:
    1. If toId or fromId is set, but not the to or from email address, get an email address from the users collection, and visa versa, if a to or from email is specified, but not to/from ids the hook will try to guess the id from the specified email.
    2. If the template property is specified, and no html property is specified the hook will run the template to get html for the email.

If you don't need/want the hook to run you can reset the default hooks by running:

    // Remove default beforeProcess hook
    Emails.routes.default.beforeProcess = []

However if you just want to override some of the fields set by the default hook you can add your own beforeProcess hook (which will run earlier than the default hook).

Templates
----------------------
Write your templates like you would client side templates and save them as .spacebars files. Then reference them by name when using them for Emails and they are accessible on the Template object. You can define and use template helpers and global template helpers the same way you would for client side templates.

TODO:
----------------------
Document remaining features:
1. Auto process emails
2. Email reply handling
3. Threads
4. Hooks
5. Building your own email provider
6. The send queue
7. Drafts
8. Email metadata and templates
9. Layout templates
10. Context.get function should check 1) helpers, 2) context, 3) email

Refactor library with a new, better api.

