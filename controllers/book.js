const Book = require('../models/Book')
const fs = require('fs');

// READ

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  }

  exports.getOneBook = (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  }

// CREATE

  exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
  
    book.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
  };

  // DELETE

  exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({message: 'Not allowed !'});
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({_id: req.params.id})
          .then(() => {res.status(200).json({message: 'Delete successful !'})})
          .catch(error => res.status(401).json({ error }))
        })
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    })
  };