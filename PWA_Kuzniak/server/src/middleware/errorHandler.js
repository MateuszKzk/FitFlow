const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  if (process.env.MODE !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ error: 'An error occurred on the server' });
};

const notFoundHandler = (req, res) => {
  console.warn('Not Found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'The resource was not found on this server' });
};

export { errorHandler, notFoundHandler };
