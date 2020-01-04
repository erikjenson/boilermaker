const router = require('express').Router();

//serve up auth routes.
router.use('/auth', require('./auth'));

router.use((res, req, next) => {
  const err = new Error('Not found.');
  err.status = 404;
  next(err);
});

module.exports = router;
