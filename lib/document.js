function Document(value) {
  this.value = value || {};
  this.__isDocument = true;
}

Document.prototype.set = function(path, value) {
  var idx = path.lastIndexOf('.');
  if(idx !== -1) {
    var prop = path.slice(idx + 1);
    path = path.slice(0, idx);
    var sub = getNested(this, path);
    sub.set(prop, value);
    return;
  }
  
  var type = this.model.attr(path);
  // We should probably either throw an exception here or at least
  // add a configuration option to do so
  if(! type) return;
  
  
  this.value[path] = type.runSetters(value, this);
};

Document.prototype.get = function(path) {
  if(path.indexOf('.') !== -1)
    return getNested(this, path);
  
  var type = this.model.attr(path);
  var value = this.value[path];
  
  // We should probably either throw an exception here or at least
  // add a configuration option to do so 
  if(! type) return;
  
  if(type.complex && ! is(value)) {
    value = this.value[path] = new type(value);
  }
  
  return type.runGetters(value, this);
};

function getNested(doc, path) {
  var val = doc;
  
  path.split('.').forEach(function(part) {
    val = val && val.get(part);
  });
  
  return val;
}

function is(value) {
  return value && value.__isDocument;
}

Document.prototype.toJSON = function() {
  var value = this.value;
  var json = {};
  
  Object.keys(value).forEach(function(key) {
    var val = value[key];
    json[key] = is(val) ? val.toJSON() : val;
  });
  
  return json;
};

module.exports = Document;