import express from "express";
import { User } from "../models/user.js";
import logger from "../startup/logger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const contacts = await User.find();
    return res.status(200).send(contacts);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const contact = await User.findById(_id);
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

router.delete("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const contact = await User.findById(_id);
    if (!contact) {
      return res
        .status(404)
        .send(
          "The contact with the given ID was not found or has already been deleted."
        );
    }
    const deletedContact = await User.findByIdAndDelete(_id);

    return res.status(200).send(deletedContact);
  } catch (error) {
    logger.error(error);
    return res.status(500).send("An unexpected error occurred!");
  }
});

export default router;
