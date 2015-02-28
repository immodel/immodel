var ware = require('ware');

module.exports = function(model) {
  model._validators = model._validators || [];
    
  model.validators = ware();
  
  function createPipeline(validators) {
    var pipeline = ware();
    validators.forEach(function(validator) {
      var fn = validator[0];
      var key = validator[1];
      
      pipeline.use(function(value, next) {
        fn.length === 1
          ? handle(fn(value))
          : fn(value, handle);
        
        function handle(valid) {
          setTimeout(function() {
            if(valid === false) {
              var err = new Error;
              err.key = key;
              return next(err);
            }
            
            next(null, value);
          });
        }
      });
    });
    
    return pipeline;
  }
  
  model.validator = function(fn, key) {
    return this.use(function(model) {
      model._validators.push([fn, key]);
      model.validators = createPipeline(model._validators);

      return model;
    });
  };
  
  model.removeValidator = function(fn, key) {
    return this.use(function(model) {
      model._validators = model._validators.filter(function(validator, idx) {
        return ! (validator[0] === fn && validator[1] === key);
      });
      
      model.validators = createPipeline(model._validators);      
      return model;
    })
  };
  
  model.validate = function(doc, cb) {
    var attrs = this.attrs;
    var keys = Object.keys(attrs);
    var n = keys.length;
    var errors = [];

    // Run our own validators first (a model may have 
    // validators on its root that validate relations
    // between elements of the model)
    this.validators.run(doc, function(err) {
      if(err) return cb(err);
      if(keys.length === 0) return cb(null);
      keys.forEach(function(path) {
        var type = attrs[path];
        var value = doc.get(path);
        type.validate(value, function(err) {
          n--;
          if(err) errors.push(err);
          if(n === 0) cb(errors.length ? errors : null);
        });
      });
    });
    
    return this;
  };
  
  model.on('init', function(evt) {
    evt.doc.validate = function(cb) {
      this.model.validate(this, cb);
      return this;      
    };
  });
  
  return model;
};