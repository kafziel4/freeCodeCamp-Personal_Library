'use strict';

const mongodb = require('mongodb');
const mongoose = require('mongoose');

const uri = `mongodb+srv://admin:${process.env.PW}@cluster0.didrg.mongodb.net/personal_library?retryWrites=true&w=majority`;

module.exports = function (app) {

  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  let bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  });

  let Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      let arrayOfBooks = [];

      Book.find(
        {},
        (error, results) => {
          if(!error && results) {
            results.forEach((result) => {
              let book = result.toJSON();
              book['commentCount'] = book.comments.length;
              arrayOfBooks.push(book);
            });
            return res.json(arrayOfBooks);
          }
        }
      )
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if(!title) {
        return res.json('missing required field title');
      };

      let newBook = new Book({
        title: title,
        comments: []
      });
      newBook.save((error, savedBook) => {
        if(!error && savedBook) {
          return res.json(savedBook);
        }
      });
    })
    
    .delete(function(req, res){
      Book.remove(
        {},
        (error, jsonStatus) => {
          if(!error && jsonStatus) {
            return res.json('complete delete successful');
          }
        }
      );
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      let bookId = req.params.id;

      Book.findById(
        bookId,
        (error, result) => {
          if(!error && result) {
            return res.json(result)
          }
          else if(!result) {
            return res.json('no book exists');
          }
        }
      );
    })
    
    .post(function(req, res){
      let bookId = req.params.id;
      let comment = req.body.comment;
      
      if(!comment) {
        return res.json('missing required field comment');
      }
      
      Book.findByIdAndUpdate(
        bookId,
        { $push: { comments: comment } },
        { new: true },
        (error, updatedBook) => {
          if(!error && updatedBook) {
            return res.json(updatedBook);
          }
          else if(!updatedBook) {
            return res.json('no book exists');
          }
        }
      );
    })
    
    .delete(function(req, res){
      let bookId = req.params.id;

      Book.findByIdAndRemove(
        bookId,
        (error, deletedBook) => {
          if(!error && deletedBook) {
            return res.json('delete successful');
          }
          else if(!deletedBook) {
            return res.json('no book exists');
          }
        }
      );
    }); 
};