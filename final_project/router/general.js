const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registro de usuario
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({
        message: "User Added Successfully!!! Now you can log in"
      });
    } else {
      return res.status(404).json({ message: "User already exists!!!" });
    }
  }
  res.status(404).json({ message: "Unable to register User!!!" });
});

// Obtener lista de libros disponibles en la tienda usando promesas
public_users.get('/', async function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then((data) => res.json(data))
  .catch((err) => res.status(500).json({ message: "Error retrieving books" }));
});

// Obtener detalles del libro basado en ISBN usando async/await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Obtener detalles del libro basado en el autor usando async/await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("Books not found");
      }
    });
    res.json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Obtener todos los libros basados en el título usando async/await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const booksByTitle = Object.values(books).filter(book => book.title === title);
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("Books not found");
      }
    });
    res.json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Obtener reseña de un libro
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book.reviews);
  } else {
    res.json({ message: `Book with the isbn ${isbn} not found` });
  }
});

module.exports.general = public_users;