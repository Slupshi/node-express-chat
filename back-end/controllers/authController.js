const sUser = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req, res, next) => {
  sUser
    .findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur introuvable" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
          }
          res.status(200).json({
            userId: user._id,
            name: user.name,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
              expiresIn: "48h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.register = async (req, res, next) => {
  let hash = await bcrypt.hash(req.body.password, 10);

  const user = new sUser({
    name: req.body.name,
    email: req.body.email,
    password: hash,
  });

  user
    .save()
    .then(() => res.status(201).json({ message: "Crée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.loginFromToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  const userId = decodedToken.userId;
  if (req.body.userId && req.body.userId !== userId) {
    return res.status(500).json({ error: "Invalid token" });
  }

  sUser
    .findOne({ _id: userId })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur introuvable" });
      }

      res.status(200).json({
        userId: user._id,
        name: user.name,
        token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "48h",
        }),
      });
    })
    .catch((error) => res.status(500).json({ error }));
};
