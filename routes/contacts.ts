import express from "express";
import { Contact, validateContact } from "../models/contact";

const router = express.Router();

router.get("/", async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).send(contacts);
});

router.get("/:id", async (req, res) => {
  const _id = req.params.id;
  const contact = await Contact.findById(_id);
  if (!contact) {
    res.status(404).send("The contact with the given ID was not found!");
  }

  res.status(200).send(contact);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const { error } = validateContact(body);
  if (error) res.status(400).send(error.details[0].message);
  const newContact = await Contact.create(body);
  res.status(201).send(newContact);
});

router.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  const contact = await Contact.findById(_id);
  if (!contact) {
    res
      .status(404)
      .send(
        "The contact with the given ID was not found or has already been deleted."
      );
  }
  const deletedContact = await Contact.findByIdAndDelete(_id);

  res.status(200).send(deletedContact);
});

export default router;
