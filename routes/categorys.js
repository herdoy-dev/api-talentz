import express from "express";
import admin from "../middlewares/admin.js";
import auth from "../middlewares/auth.js";
import { Category, validateCategory } from "../models/category.js";
import Response from "../utils/Response.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).send(new Response(true, "Success", categories));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

router.get("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findById(_id);
    if (!category) {
      return res
        .status(404)
        .send(
          new Response(false, "The Category with the given ID was not found!")
        );
    }
    res.status(200).send(new Response(true, "Success", category));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

router.post("/", [auth, admin], async (req, res) => {
  try {
    const body = req.body;
    const { error } = validateCategory(body);
    if (error) {
      return res
        .status(400)
        .send(new Response(false, error.details[0].message));
    }
    const newCategory = await Category.create(body);
    res.status(201).send(new Response(true, "Category Created", newCategory));
  } catch (error) {
    res.status(500).send(new Response(false, "Something went wrong"));
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findById(_id);
    if (!category) {
      return res
        .status(404)
        .send(
          new Response(false, "The category with the given ID was not found.")
        );
    }

    const body = req.body;
    const { error } = validateCategory(body);
    if (error) {
      return res
        .status(400)
        .send(new Response(false, error.details[0].message));
    }

    const updatedCategory = await Category.findByIdAndUpdate(_id, body, {
      new: true,
    });
    res
      .status(200)
      .send(new Response(true, "Category Updated", updatedCategory));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  try {
    const _id = req.params.id;
    const category = await Category.findById(_id);
    if (!category) {
      return res
        .status(404)
        .send(
          new Response(false, "The category with the given ID was not found.")
        );
    }

    const deletedCategory = await Category.findByIdAndDelete(_id);
    res
      .status(200)
      .send(new Response(true, "Category Deleted", deletedCategory));
  } catch (error) {
    res.status(500).send(new Response(false, "Internal Server Error"));
  }
});

export default router;
