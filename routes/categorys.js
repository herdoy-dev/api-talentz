import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { Category, validateCategory } from "../models/category.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.status(200).send(categories);
});

router.get("/:id", async (req, res) => {
  const _id = req.params.id;
  const category = await Category.findById(_id);
  if (!category)
    return res
      .status(404)
      .send("The Category with the given ID was not found!");

  res.status(200).send(category);
});

router.post("/", [auth, admin], async (req, res) => {
  const body = req.body;
  const { error } = validateCategory(body);
  if (error) return res.status(400).send(error.details[0].message);
  const newCategory = await Category.create(body);
  res.status(201).send(newCategory);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const _id = req.params.id;
  const category = await Category.findById(_id);
  if (!category)
    return res
      .status(404)
      .send("The category with the given ID was not found.");

  const body = req.body;
  const { error } = validateCategory(body);
  if (error) return res.status(400).send(error.details[0].message);
  const updatedCategory = await Category.findByIdAndUpdate(_id, body, {
    new: true,
  });
  res.status(200).send(updatedCategory);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const _id = req.params.id;
  const category = await Category.findById(_id);
  if (!category)
    return res
      .status(404)
      .send("The category with the given ID was not found.");

  const deletedCategory = await Category.findByIdAndDelete(_id);
  res.status(200).send(deletedCategory);
});

export default router;
