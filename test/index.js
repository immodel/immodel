var sinon = require('sinon');
var assert = require('assert');
var immodel = require('..');


describe('immodel', function() {
  var model;
  
  beforeEach(function() {
    // Get a fresh model for each test
    model = immodel.use();
  });
  
  describe('.use', function() {
    it('should return a new reference', function() {
      assert(model.use() !== model);
    });
    
    it('should accept an object as a plugin', function() {
      var spy = model.spy = sinon.spy();
      model.use({spy: 'test'});
      assert(spy.calledOnce);
      assert(spy.calledWith('test'));
    });
    
    it('should not pollute the parent', function() {
      model.attrs = {test: 1};
      var child = model.use(function() {
        this.attrs.test = 2;
      });
      
      assert(model.attrs.test === 1);
      assert(child.attrs.test === 2);
    });
    
    it('should inherit arrays properly', function() {
      model.validators = ['test'];
      var tmp = model.use(function() {
        this.validators.push('test2');
      });
      assert.deepEqual(tmp.validators, ['test', 'test2']);
    });
  });
  
  describe('construction', function() {  
    it('should emit an init event', function() {
      var spy = sinon.spy();
      model.on('init', spy);
      
      new model();
      assert(spy.calledOnce);
    });
    
    it('should allow the event handlers to replace the return value', function() {
      var spy = sinon.spy(function(evt) {
        evt.doc = {test: 'test'};
      });
      
      model.on('init', spy); 
      var doc = new model();
      assert(doc.test === 'test');
    });
    
    it('should inherit event handlers', function() {
      var spy1 = sinon.spy();
      model.on('init', spy1);
      var spy2 = sinon.spy();
      var model2 = model.use().on('init', spy2);
      
      new model();
      assert(spy1.calledOnce);
      assert(! spy2.called);
      new model2();
      assert(spy1.calledTwice);
      assert(spy2.calledOnce);
    });
  });
});