// Write your package code here!

Emails = {};

Emails.config = {
	// boolean - whether or not to place the messages in a queue before sending them
	queue: false
	// boolean - whether or not to leave/insert messages in the emails collection after sending them
	// if false will delete messages which have been sent
	// if true will upsert messages which have been sent
	, persist: true
	// boolean - whether to observe the emails collection and automatically process/send
	// emails as they are added.
	// also causes the queue to be processed on startup.
	, autoprocess: false
};

Emails.initialize = function (config) {

};

Emails.send = function (email, warn) {
	// preprocesses a message and then either queues or immediately sends it
	// depending on the queue config option.
};

Emails.process = function (email, warn) {
	// pre-processes an email for enquement or delivery
};

Emails.enqueue = function (email, warn) {
	// inserts an email into the queue
};

Emails.deliver = function (email, warn) {
	// actually sends an email
};

// Preprocessor helpers
// should be in the format function (arg, email)

Emails.getUser = function (emailAddress, email) {
	// returns a userId by processing an email address.
};

Emails.getAddress = function (userId, email) {
	// returns the email address for a particular user
};

// Pre-processers
// these processors are run in the order listed
// should be in the format: function (email, cache) where
// email is the email object to be stored/sent
// cache is an object which passes/returns metadata we don't need to
//       store on the email record, for example {fromUser: Users.findOne(fromId)}

// getMetadata and preProcess should be app defined and will always be run
// each of the other functions will be run only if the corrosponding property is missing

Emails.getMetadata = function (email, cache) {
	// sets any app defined properties which should be stored on the email record
	// and available to other preprocessors
};

Emails.getFromId = function (email, cache) {
	// sets the fromId of an email
};

Emails.getToId = function (email, cache) {
	// sets the toId of an email
};

Emails.getText = function (email, cache) {
	// sets the plain text email copy
};

Emails.getHtml = function (email, cache) {
	// sets the html email copy
};

Emails.preProcess = function (email, cache) {
	// user defined method to do any processing of the email which needs to happen after the email
	// processing logic is finished.
};


