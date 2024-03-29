
module.exports = {
  async poll({ homey, query }) {
    return homey.app.app.pollValues(query.id);
  },

  async read({ homey, query }) {
    return homey.app.getValues(query.id);
  }
};
