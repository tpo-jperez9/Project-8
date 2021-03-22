const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const Book = require('../models').Book;

// Static middleware for serving static files
router.use(express.static("public"));

function asyncHandler(cb){
  return async(req, res, next) => {
    try{
	  await cb(req, res, next);
	}
	catch(err){
	  err.status = err.status || 500;
	  err.message = err.message || "Oh no something went wrong!";
	  res.render('error', {error:err})
	}
  }
}

/* GET home page. */
/*
router.get('/', async (req, res, next) => {
  //res.render('index', { title: 'Express' });
  const books = await Book.findAll();
  console.log( books.map(book => book.toJSON()) );
});*/

router.get('/', asyncHandler(async (req, res, next) => {
  res.redirect('/books')
  //res.render('index', { title: 'Express' });
}));

router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll();
  //console.log( books.map(book => book.toJSON()) );
  res.render('index', {
  	books: books,
  })
}))

router.get('/books/new', asyncHandler(async (req, res, next) => {
  res.render('new-book.pug');
}))

router.post('/books/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if(error.name === "SequelizeValidationError"){
      book = await Book.build(req.body);
      res.render('new-book.pug', {book, errors: error.errors})
    }
    else{
    	throw error;
    }
  }
}))

router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  
  if(book){
    res.render('update-book', {
      book: book,
    })
  }
  else{
    next(createError(404, "Page Not Found"));
  }
}))

router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
  	book = await Book.findByPk(req.params.id);
  	if(book){
      await book.update(req.body);
      res.redirect('/books');
  	}
  	else{
  		res.sendStatus(404);
  	}
  } catch (error) {
  	if(error.name == "SequelizeValidationError"){
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', {book, errors: error.errors})
  	}
  	else{
  		throw error;
  	}
  }
}))

router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  await book.destroy();
  res.redirect("/");
}))



module.exports = router;