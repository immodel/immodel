var chai = require('chai');
var expect = chai.expect;
var model = require('../');

require('debug-trace')({always: true});

describe('models', function() {
  it('should work', function() {
    var User = model
      .attr('username', {type: 'string'});

    var doc = new User();
    doc.get('username');
    expect(doc.get('username')).to.equal('');
    
    doc.set('username', 'test');
    expect(doc.get('username')).to.equal('test');
    
    doc.set('username', 1);
    expect(doc.get('username')).to.not.equal(1);
    expect(doc.get('username')).to.equal('1');
  });
});

describe('inheritance', function() {
  it('should work', function() {
    var User = model
      .attr('username', 'string');
       
    var Teacher = User
      .attr('class', 'string');
    
    // Should inherit
    var doc = new Teacher();
    expect(doc.get('username')).to.equal('');
    expect(doc.get('class')).to.to.equal('');
    
    // Should not pollute the parent
    doc = new User();
    expect(doc.get('username')).to.equal('');
    expect(doc.get('class')).to.equal(undefined);
  });
});

describe('nesting', function() {
  it('should validate nested objects', function(done) {
    var User = model
      .attr('name', model
        .attr('familyName', {type: 'string', required: true})
        .attr('givenName', 'string'));
    
    var doc = new User();
    expect(doc.get('name.familyName')).to.equal('');
    expect(doc.get('name.givenName')).to.equal('');

    doc.validate(function(err) {
      expect(err).not.to.be.null;
      done();
    });
  });
  
  it('should set nested properties', function() {
    var User = model
      .attr('name', model
        .attr('familyName', 'string'));
      
    var doc = new User();
    doc.set('name.familyName', 'test');
    expect(doc.get('name.familyName')).to.equal('test');
  });
  
  it('should allow validators to be set on objects', function(done) {
    // Define a validator that expresses
    // a relation between two properties
    // on the root of this model
    var Name = model
      .attr('familyName', 'string')
      .attr('givenName', 'string')
      .validator(function(value) {
        return !! (value.get('givenName') || value.get('familyName'));
      }, 'both');

    var User = model
      .attr('name', Name);
      
    var doc = new User();
    doc.validate(function(err) {
      expect(err).not.to.be.null;
      expect(err[0].key).to.equal('both');
      
      doc.set('name.givenName', 'test');
      doc.validate(function(err) {
        expect(err).to.be.null;
        doc.set('name.familyName', 'test');
        doc.set('name.givenName', null);
        doc.validate(function(err) {
          expect(err).to.be.null;
          doc.set('name.familyName', 'test');
          doc.validate(function(err) {
            expect(err).to.be.null;
            done();
          });
        });
      });
    });
  });
  
  it('should work with nested models', function() {
    var Name = model
      .attr('givenName', {type: 'string'});
      
    var User = model
      .attr('name', Name);
       
    var doc = new User();
    expect(doc.get('name.givenName')).to.equal('');
  });
});

describe('default values', function() {
  it('should work', function() {
    var User = model
      .attr('grade', {type: 'number', default: 3});
      
    var doc = new User();
    expect(doc.get('grade')).to.equal(3);
    doc.set('grade', 4);
    expect(doc.get('grade')).to.equal(4);
  });
});

describe('discriminators', function() {
  it('should work', function() {
    var User = model
      .attr('username', 'string')
      .type('user', {
        discriminator: {
          key: 'userType',
          types: ['teacher', 'student']
        }
      });
    
    var Teacher = User
      .attr('subject', 'string')
      .type('teacher');
      
    var Student = User
      .attr('grade', 'number')
      .type('student');
    
    var doc = new User({userType: 'teacher'});
    
    expect(doc.get('username')).to.equal('');
    expect(doc.get('subject')).to.equal('');
    expect(doc.get('grade')).to.equal(undefined);
    
    doc = new User({});
    expect(doc.get('username')).to.equal('');
    expect(doc.get('subject')).to.equal(undefined);
    expect(doc.get('grade')).to.equal(undefined);
    
    doc = new User({userType: 'student'});
    expect(doc.get('username')).to.equal('');
    expect(doc.get('subject')).to.equal(undefined);
    expect(doc.get('grade')).to.equal(0);
  });
  
  it('should work on nested documents', function() {
    var Share = model
      .attr('object', 'object');
    
    var Obj = model
      .attr('content', 'string')
      .type('object', {
        discriminator: {
          key: 'objectType',
          types: ['question', 'video']
        }
      });
    
    var Question = Obj
      .attr('answer', 'string')
      .type('question');
    
    var Video = Obj
      .attr('url', 'string')
      .type('video');
      
    var doc = new Share({object: {}});
    
    expect(doc.get('object.content')).to.equal('');
    expect(doc.get('object.answer')).to.equal(undefined);
    expect(doc.get('object.url')).to.equal(undefined);
    
    doc = new Share({object: {objectType: 'question'}});

    expect(doc.get('object.content')).to.equal('');
    expect(doc.get('object.answer')).to.equal('');
    expect(doc.get('object.url')).to.equal(undefined);
    
    doc = new Share({object: {objectType: 'video'}});
    
    expect(doc.get('object.content')).to.equal('');
    expect(doc.get('object.answer')).to.equal(undefined);
    expect(doc.get('object.url')).to.equal(''); 
  });
});