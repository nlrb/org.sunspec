module.exports = [
    {
        description: 'Request values to be read',
        method: 'POST',
        path: '/read/',
        requires_authorizaton: false,
        fn: function(callback, args) {
            var pollValues = Homey.app.api.pollValues;
			if (args.body != null && args.body.id != null) {
				pollValues(args.body.id);
				callback(null, true);
			} else {
				callback('Invalid arguments', null);
			}
        }
    }
];