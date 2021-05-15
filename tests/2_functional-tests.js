const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id = '';

suite('Functional Tests', function() {

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'The Lord of the Rings'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'The Lord of the Rings');
            assert.isNotNull(res.body._id);
            id = res.body._id
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'commentCount');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            done();
          });
      });      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/' + '1234')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${id}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, id);
            assert.equal(res.body.title, "The Lord of the Rings");
            done();
          });
      }); 
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post(`/api/books/${id}`)
          .send({
            comment: 'test comment'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, id);
            assert.isTrue(res.body.comments.includes('test comment'));
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post(`/api/books/${id}`)
          .send({
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/' + '1234')
          .send({
            comment: 'test comment'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });  
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete(`/api/books/${id}`)
          .send({            
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/' + '1234')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
    });
  });
});