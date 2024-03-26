const Book = require('../models/Book');
const path = require('path');
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
  };

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
  };

  exports.bestratingBook = (req, res, next) => {
    Book.find()
    .sort({averageRating: -1})
    .limit(3)
    .then(bestRating => res.status(200).json(bestRating))
    .catch(error => res.status(400).json({ error }));
  };

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

  exports.addRating = (req, res, next) => {
      Book.findOne({ _id: req.params.id })
      .then((book) => {
        book.ratings.push({userId: req.auth.userId, grade: req.body.rating});
        book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;
        book.averageRating = book.averageRating.toFixed(1);
    
        return book.save()
          .then((book) => res.status(201).json(book))
          .catch(error => res.status(400).json({ error }));
      });
    };
  
  // MODIFY

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not allowed'});
      } else {
        if (req.file && book.imageUrl) {
          const imagePath = path.join(__dirname, '..', 'images', path.basename(book.imageUrl));
          // Check if the file exists, then delete it
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Object modified !'}))
        .catch(error => res.status(401).json({ error }))
      }
    })
    .catch((error) =>{
      res.status(400).json({ error });
    })
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