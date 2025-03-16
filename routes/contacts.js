import express from "express";
import { Contact, validateContact } from "../models/contact.js";
import logger from "../startup/logger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    return res.status(200).send(contacts);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const contact = await Contact.findById(_id);
    if (!contact) {
      return res
        .status(404)
        .send("The contact with the given ID was not found!");
    }

    return res.status(200).send(contact);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const { error } = validateContact(body);
    if (error) return res.status(400).send(error.details[0].message);
    const newContact = await Contact.create(body);
    return res.status(201).send(newContact);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const contact = await Contact.findById(_id);
    if (!contact) {
      return res
        .status(404)
        .send(
          "The contact with the given ID was not found or has already been deleted."
        );
    }
    const deletedContact = await Contact.findByIdAndDelete(_id);

    return res.status(200).send(deletedContact);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

export default router;
