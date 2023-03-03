const sUser = require("../models/user");

exports.getAll = (req, res, next) => {
  sUser
    .find()
    .then((users) => res.status(200).json(users))
    .catch((error) => res.status(400).json({ error }));
};

exports.get = (req, res, next) => {
  sUser
    .findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(404).json({ error }));
};

exports.post = (req, res, next) => {
  const user = new sUser({ ...req.body });
  user
    .save()
    .then((item) => {
      res.status(201).json({
        message: "User enregistré",
        data: item,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.put = (req, res, next) => {
  sUser
    .updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "User modifié" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.delete = (req, res, next) => {
  sUser
    .deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "User supprimé" }))
    .catch((error) => res.status(400).json({ error }));
};
