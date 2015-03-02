var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var immodel = require('../').model;

chai.use(require('sinon-chai'));

describe('immodel', function() {
  var model;
  
  beforeEach(function() {
    // Get a fresh model for each test
    model = immodel.use();
  });
  
  describe('.use', function() {
    it('should return a new reference', function() {
      expect(model.use()).to.not.equal(model);
    });
    
    it('should accept an object as a plugin', function() {
      model.spy = sinon.spy();
      model.use({spy: 'test'});
      expect(model.spy).to.have.been.calledOnce;
      expect(model.spy).to.have.been.calledWith('test');
    });
    
    it('should not pollute the parent', function() {
      model.attrs = {test: 1};
      var child = model.use(function(model) {
        model.attrs.test = 2;
      });
      
      expect(model.attrs.test).to.equal(1);
      expect(child.attrs.test).to.equal(2);
    });
  });
  
  describe('.is', function() {
    it('should work', function() {
      expect(model.is(model)).to.be.true;
      expect(model.is(model.use())).to.be.true;
      expect(model.is({})).to.be.false;
    });
  });
  
  describe('.type / .lookup', function() {
    it('should work', function() {
      model.type('test');
      expect(model.lookup('test')).to.equal(model);
    });
    
    it('should allow custom constructors', function() {
      var spy = sinon.spy();
      model.type('test', spy);
      expect(model.lookup('test')).to.equal(spy);
    });
  });

  describe('construction', function() {  
    it('should emit an init event', function() {
      var spy = sinon.spy();
      model.on('init', spy);
      
      new model();
      expect(spy).to.have.been.calledOnce;
    });
    
    it('should allow the event handlers to replace the return value', function() {
      var spy = sinon.spy(function(evt) {
        evt.doc = {test: 'test'};
      });
      
      model.on('init', spy); 
      var doc = new model();
      expect(doc.test).to.equal('test');
    });
    
    it('should inherit event handlers', function() {
      var spy1 = sinon.spy();
      model.on('init', spy1);
      var spy2 = sinon.spy();
      var model2 = model.use().on('init', spy2);
      
      new model();
      expect(spy1).to.have.been.calledOnce;
      expect(spy2).not.to.have.been.called;
      new model2();
      expect(spy1).to.have.been.calledTwice;
      expect(spy2).to.have.been.calledOnce;
    });
  });
});