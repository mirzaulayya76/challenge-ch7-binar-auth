const jwt = require('jsonwebtoken');

// Fungsi untuk redirect player ke halaman login, kalau dia belum authenticated.
function restrictPageAccess(req, res, next) {
  const token = req.session.token;

  jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
    if (err || !decodedToken) {
      return res.redirect('/login');
    }
    req.playerId = decodedToken.id;
    next();
  });
}

function withAuthentication(req, res, next) {
  // Get the authorization header from the request
  const authHeader = req.headers.authorization;

  // Check if the header is present
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  // Headers: {
  //   Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0MTIzIiwiaWF0IjoxNjgwNzA5MjU3LCJleHAiOjE2ODA3MTI4NTd9.MkaC9m6xTM6dJlPkYGJiPGKcNvdAAgpVO5seXEHHl9A"
  // }

  // Split the header into its components
  const [scheme, token] = authHeader.split(' ');

  // Check if the scheme is correct
  if (scheme !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization scheme' });
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach the decoded token to the request object
    req.user = decoded;

    // Call the next middleware function
    next();
  });
}

module.exports = { restrictPageAccess, withAuthentication };
