const Homey = require('homey');

module.exports = [
  {
    method: 'GET',
    path: '/poll/',
    public: true,
    fn: function(args, callback){
      const result = Homey.app.pollValues(args.query.id);
      // callback follows ( err, result )
      callback(null, result);
    }
  },
  {
    method: 'GET',
    path: '/read/',
    public: true,
    fn: function(args, callback){
      const result = Homey.app.getValues(args.query.id);
      // callback follows ( err, result )
      callback(null, result);
    }
  }
];
