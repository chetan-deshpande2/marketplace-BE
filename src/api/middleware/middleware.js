import jwt from "jsonwebtoken";
const middleware = {};

middleware.verifyToken = (req, res, next) => {
  try {
    var token = req.headers.authorization;
    if (!token) {
      return res.send("Unauthorized header");
    }
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
      if (err) return res.send("Unauthorized user");

      if (decoded.sRole === "user") {
        req.userId = decoded.id;
        req.role = decoded.sRole;
        req.name = decoded.oName;
        req.email = decoded.sEmail;
        next();
      } else return res.send("Un Authorized");
    });
  } catch (error) {
    return res.send("server Error");
  }
};

middleware.proceedWithoutToken = (req, res, next) => {
  next();
};

middleware.verifyWithoutToken = (req, res, next) => {
  try {
    // if (!req.session["_id"] && !req.session["admin_id"]) return res.reply(messages.unauthorized());

    var token = req.headers.authorization;

    if (token && token != undefined && token != "") {
      token = token.replace("Bearer ", "");
      jwt.verify(token, "thisistestsecret", function (err, decoded) {
        if (err) {
          return res.send("unauthorized");
        }

        next();
      });
    } else {
      next();
    }
  } catch (error) {
    return res.reply(messages.server_error());
  }
};

module.exports = middleware;
