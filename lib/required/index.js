module.exports = function(model) {
  model.required = function(isRequired) {
    return isRequired
      ? this.validator(this._requiredValidator, 'required')
      : this.removeValidator(this._requiredValidator, 'required');
  };
  
  model._requiredValidator = model._requiredValidator || function(value) {
    return !! value;
  };
  
  model.requiredValidator = function(fn) {
    return this.use(function(model) {
      model._requiredValidator = fn;
    });
  };
};