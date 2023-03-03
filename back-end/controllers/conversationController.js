const sConversation = require("../models/conversation");

exports.getAll = (req, res, next) => {
  sConversation
    .find()
    .then((conversations) => res.status(200).json(conversations))
    .catch((error) => res.status(400).json({ error }));
};

exports.get = (req, res, next) => {
  sConversation
    .findOne({ _id: req.params.id })
    .then((conversation) => res.status(200).json(conversation))
    .catch((error) => res.status(404).json({ error }));
};

exports.post = (req, res, next) => {
  const conversation = new sConversation({ ...req.body });
  conversation
    .save()
    .then((item) => {
      res.status(201).json({
        message: "Conversation enregistrée",
        data: item,
      });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.put = async (req, res, next) => {
  sConversation
    .updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Conversation modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.delete = (req, res, next) => {
  sConversation
    .deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Conversation supprimée" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.own = (req, res, next) => {
  sConversation
    .find({
      participants: { userID: req.body.userID, userName: req.body.userName },
    })
    .then((conversations) => res.status(200).json(conversations))
    .catch((error) => res.status(400).json({ error }));
};
