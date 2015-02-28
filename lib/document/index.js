function Document(doc) {
  this.doc = doc || {};
}

Document.prototype.set = function(path, value) {
  var idx = path.lastIndexOf('.');
  if(idx !== -1) {
    var prop = path.slice(idx + 1);
    path = path.slice(0, idx);
    var sub = this._getNested(path);
    sub.set(prop, value);
    return;
  }
  
  var type = this.model.attr(path);
  // We should probably either throw an exception here or at least
  // add a configuration option to do so
  if(! type) return;
  
  
  this.doc[path] = type.runSetters(value, this);
};

Document.prototype.get = function(path) {
  if(path.indexOf('.') !== -1)
    return this._getNested(path);
  
  var type = this.model.attr(path);
  var value = this.doc[path];
  
  // We should probably either throw an exception here or at least
  // add a configuration option to do so 
  if(! type) return;
  
  if(type.complex && ! (value instanceof Document)) {
    value = this.doc[path] = new type(value || {});
  }
  
  return type.runGetters(value, this);
};

Document.prototype._getNested = function(path) {
  var val = this;

  path.split('.').forEach(function(part) {
    val = val && val.get(part);
  });
  
  return val;
};

module.exports = Document;