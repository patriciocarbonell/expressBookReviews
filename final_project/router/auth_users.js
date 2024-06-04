const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Verifica si un usuario ya existe
const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length > 0;
};

// Verifica las credenciales del usuario
const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validUsers.length > 0;
};

// Solo los usuarios registrados pueden iniciar sesión
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and Password required!!!" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({ message: "User logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username and password!!!" });
  }
});

// Agrega o modifica una reseña de un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Obtén el nombre de usuario de la sesión
  const username = req.session.authorization.username;

  // Obtén el ISBN del libro de los parámetros de la ruta
  const isbn = req.params.isbn;

  // Obtén el libro de la base de datos
  let book = books[isbn];
  if (book) {
    // Obtén la reseña del cuerpo de la solicitud
    let review = req.body.review;
    if (review) {
      // Actualiza o agrega la reseña del usuario
      book.reviews[username] = review;
      books[isbn] = book;
      return res.status(200).send(`Review for book with ISBN ${isbn} updated successfully`);
    } else {
      return res.status(400).json({ message: "Review content is missing" });
    }
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Elimina una reseña de un libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Obtén el nombre de usuario de la sesión
  const username = req.session.authorization.username;

  // Obtén el ISBN del libro de los parámetros de la ruta
  const isbn = req.params.isbn;

  // Obtén el libro de la base de datos
  let book = books[isbn];
  if (book) {
    if (book.reviews && book.reviews[username]) {
      // Elimina la reseña del usuario específico
      delete book.reviews[username];
      books[isbn] = book;
      return res.status(200).send(`Review for book with ISBN ${isbn} deleted successfully`);
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

