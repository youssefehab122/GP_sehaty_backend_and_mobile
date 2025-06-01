import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  addMedicine,
  updateMedicine,
  removeMedicine,
  getPharmacyMedicines,
} from "../controllers/pharmacyController.js";

const router = express.Router();

// Public routes
router.get("/", protect, getPharmacies);
router.get("/:id", getPharmacy);
router.get("/:id/medicines", getPharmacyMedicines);

// Protected routes
router.post("/", protect, createPharmacy);
router.put("/:id", protect, updatePharmacy);
router.delete("/:id", protect, deletePharmacy);
router.post("/:id/medicines", protect, addMedicine);
router.put("/:id/medicines/:medicineId", protect, updateMedicine);
router.delete("/:id/medicines/:medicineId", protect, removeMedicine);

export default router;
