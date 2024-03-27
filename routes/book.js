const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');
const compressImage = require('../middleware/sharp-config');


router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, compressImage, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.bestratingBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating/', auth, bookCtrl.addRating);
router.put('/:id', auth, multer, compressImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;