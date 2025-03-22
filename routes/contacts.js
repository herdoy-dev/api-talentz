import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import {
  Contact,
  validateContact,
  validateUpdatableData,
} from "../models/contact.js";

const router = express.Router();

router.get("/", [auth, admin], async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).send(contacts);
});

router.get("/:id", [auth, admin], async (req, res) => {
  const _id = req.params.id;
  const contact = await Contact.findById(_id);
  if (!contact)
    return res.status(404).send("The contact with the given ID was not found!");

  res.status(200).send(contact);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const { error } = validateContact(body);
  if (error) return res.status(400).send(error.details[0].message);
  const newContact = await Contact.create(body);
  res.status(201).send(newContact);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const _id = req.params.id;
  const contact = await Contact.findById(_id);
  if (!contact)
    return res
      .status(404)
      .send(
        "The contact with the given ID was not found or has already been deleted."
      );

  const body = req.body;
  const { error } = validateUpdatableData(body);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedContact = await Contact.findByIdAndUpdate(_id, body, {
    new: true,
  });
  res.status(200).send(updatedContact);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const _id = req.params.id;
  const contact = await Contact.findById(_id);
  if (!contact)
    return res
      .status(404)
      .send(
        "The contact with the given ID was not found or has already been deleted."
      );

  const deletedContact = await Contact.findByIdAndDelete(_id);

  res.status(200).send(deletedContact);
});

export default router;
