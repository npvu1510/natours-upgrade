const redirectAuthenticatedUsers = (req, res, next) => {
  if (res.locals.user) return res.redirect('/');

  return next();
};

export default redirectAuthenticatedUsers;
