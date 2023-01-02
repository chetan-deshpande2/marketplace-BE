import jwt from 'jsonwebtoken';

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.send('Unauthorized header');
    }
    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) return res.send('Unauthorized user');

      if (decoded.sRole === 'user') {
        req.userId = decoded.id;
        req.role = decoded.sRole;
        req.name = decoded.oName;
        req.email = decoded.sEmail;
        next();
      } else return res.send('Un Authorized');
    });
  } catch (error) {
    return res.send('server Error');
  }
};

const proceedWithoutToken = (req, res, next) => {
  next();
};
const verifyWithoutToken = (req, res, next) => {
  try {
    // if (!req.session["_id"] && !req.session["admin_id"]) return res.reply(messages.unauthorized());

    let token = req.headers.authorization;

    if (token && token !== undefined && token !== '') {
      token = token.replace('Bearer ', '');
      jwt.verify(token, 'thisistestsecret', (err, decoded) => {
        if (err) {
          return res.send('unauthorized');
        }

        next();
      });
    } else {
      next();
    }
  } catch (error) {
    return res.send(error);
  }
};

export { verifyToken, verifyWithoutToken, proceedWithoutToken };
