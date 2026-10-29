
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');

const app = express();

app.use(express.json());

// Customer session
app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

// Authentication middleware
app.use('/customer/auth/*', function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token missing'
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'fingerprint_customer', (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    req.session.username = decoded.username;
    next();
  });
});

const PORT = 5000;

// Internal API used by Axios in general.js
app.get('/api/books', (req, res) => {
  res.status(200).json(books);
});

// Customer routes
app.use('/customer', customer_routes);

// Public book routes
app.use('/', genl_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
