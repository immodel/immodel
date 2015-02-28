module.exports = function(model) {
  model.discriminator = function(prop, types) {
    return this.use(function(doc) {
      doc.on('init', function(evt) {
        var doc = evt.doc;
        var key = doc.get(prop);

        if(types.indexOf(key) !== -1) {
          var type = model.lookup(key);
          if(! (doc instanceof type)) {
            evt.doc = type(doc.doc);
          }
        }
      });
    });
  };
};