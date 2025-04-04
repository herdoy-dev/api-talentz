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
  const {
    search,
    orderBy,
    sortOrder = "asc",
    currentPage = 1,
    pageSize = 10,
    ...filters
  } = req.query;

  let query = Contact.find();

  if (search) {
    query = query.or([
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ]);
  }

  // Apply exact match filters for each field if provided
  Object.keys(filters).forEach((key) => {
    if (["firstName", "lastName", "email", "message"].includes(key)) {
      query = query.where(key).equals(filters[key]);
    }
  });

  // Apply sorting
  if (orderBy) {
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    query = query.sort({ [orderBy]: sortDirection });
  }

  // Apply pagination
  const skip = (currentPage - 1) * pageSize;
  query = query.skip(skip).limit(parseInt(pageSize));

  const contacts = await query.exec();

  let countQuery = Contact.find();

  if (search) {
    countQuery = countQuery.or([
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ]);
  }

  Object.keys(filters).forEach((key) => {
    if (["firstName", "lastName", "email", "message"].includes(key)) {
      countQuery = countQuery.where(key).equals(filters[key]);
    }
  });

  const totalCount = await countQuery.countDocuments(); // Fixed: using countQuery instead of Contact

  res.status(200).json({
    result: contacts,
    count: totalCount,
    pagination: {
      currentPage: parseInt(currentPage),
      totalPages: Math.ceil(totalCount / parseInt(pageSize)),
      pageSize,
    },
  });
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
