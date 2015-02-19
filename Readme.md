Emails for Meteor
======================
Simple emails package for meteor, supports using spacebars templates for your emails, logs messages to a collection and uses the Meteor.users collection to get email addresses and additional metadata.

API
----------------------
`Emails.initialize(config)` - extend Emails.config with your options and initialize the messages collection.

`Emails.send(email)` - send an email, or queue it for sending. `email` should be an object with to(Id), from(Id), subject and template|text|html.

`Emails.send(routeName, email)` - send an email using the specified route, `route` should be a string - the name of the route to send to, `email` should be an object.

`Emails.define(routeName[, onBeforeSend][, options])` - define a route, named `routeName`, `onBeforeSend` is a function which will be called before sending an email, `options` is an object which will extend the EmailController which sends emails.

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

Refactor library with a new, better api.

