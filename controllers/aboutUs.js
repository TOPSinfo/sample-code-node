import { Router } from "express";
import validateRequest from "../../../validate";
import {
  authMiddware,
  sessionMiddlewareAdmin,
} from "../middleware/auth-guard.middleware";
import {
  insertAboutUs,
  listAboutUsData,
  deleteAboutUs,
  getAboutUsById,
  updateAboutUsData,
} from "../services/aboutUs.service";

const router = Router();

// @Admin side Aboutus Module Related Apis
router.post("/", [authMiddware, sessionMiddlewareAdmin], addAboutUs);
router.post("/list", [authMiddware, sessionMiddlewareAdmin], getAboutUsList);
router.delete(
  "/delete/:aboutId",
  [authMiddware, sessionMiddlewareAdmin],
  removeAboutUs
);
router.get(
  "/:aboutId",
  [authMiddware, sessionMiddlewareAdmin],
  getAboutUsDetail
);
router.post(
  "/update/:aboutId",
  [authMiddware, sessionMiddlewareAdmin],
  updateAboutUsDetail
);

async function addAboutUs(req, res) {
  const document = {
    title: req.body.title,
    description: req.body.description,
    position: req.body.position,
  };

  let validation = await validateRequest(req, res, document);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }
  if (req.body.subtitle) {
    document["subtitle"] = req.body.subtitle;
  }

  try {
    await insertAboutUs(document);
    return res
      .status(200)
      .json({
        message: "About us added successfully!",
      })
      .end();
  } catch (e) {
    return res.boom.badRequest(e.toString());
  }
}

async function getAboutUsList(req, res) {
  const { pageIndex, pageSize, search } = req.body;
  const document = {
    pageIndex: parseInt(pageIndex),
    pageSize: parseInt(pageSize),
    search,
  };

  try {
    const doc = await listAboutUsData(document);
    return res.status(200).json(doc);
  } catch (e) {
    return res.boom.badRequest(e.toString());
  }
}

async function removeAboutUs(req, res) {
  const required = {
    aboutId: req.params.aboutId,
  };

  let validation = await validateRequest(req, res, required);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }

  try {
    await deleteAboutUs(required);
    return res.status(200).json({ message: "About removed successfully" });
  } catch (e) {
    return res.boom.badRequest(e.toString());
  }
}

async function getAboutUsDetail(req, res) {
  const required = {
    aboutId: req.params.aboutId,
  };

  let validation = await validateRequest(req, res, required);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }

  try {
    const doc = await getAboutUsById(required.aboutId);
    return res.status(200).json(doc);
  } catch (e) {
    return res.boom.badImplementation(e.toString());
  }
}

async function updateAboutUsDetail(req, res) {
  const required = {
    aboutId: req.params.aboutId,
  };

  let validation = await validateRequest(req, res, required);
  if (!validation.success) {
    return res.boom.badRequest(validation.errors);
  }
  const document = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    position: req.body.position,
  };

  try {
    await updateAboutUsData(required.aboutId, document);
    return res.status(200).json({
      message: "AboutUs details updated successfully",
    });
  } catch (e) {
    if (e.name === "MongoError" && e.code === 11000) {
      let errMsg = "Position already exist";
      return res.boom.badRequest(errMsg);
    } else {
      return res.boom.badImplementation(e.toString());
    }
  }
}

export default router;
