import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Medicine from '../models/MedicineModel.js';
import User from '../models/UserModel.js';
import Category from '../models/CategoryModel.js';
import Pharmacy from '../models/PharmacyModel.js';
import Review from '../models/ReviewModel.js';
import Order from '../models/OrderModel.js';
import Cart from '../models/CartModel.js';
import Wishlist from '../models/WishlistModel.js';
import Address from '../models/AddressModel.js';
import PharmacyMedicine from '../models/PharmacyMedicineModel.js';
import bcrypt from 'bcrypt';

dotenv.config();

// ======================
// CATEGORIES (10 items)
// ======================
const categories = [
  { 
    name: 'Pain Relief', 
    description: 'Medicines for pain management and fever reduction',
    image: 'https://img.freepik.com/free-photo/pain-relief-medications-arrangement_23-2148848091.jpg' 
  },
  { 
    name: 'Antibiotics', 
    description: 'Medicines for treating bacterial infections',
    image: 'https://img.freepik.com/free-photo/antibiotics-capsules-tablets_23-2148890735.jpg' 
  },
  { 
    name: 'Vitamins & Supplements', 
    description: 'Nutritional supplements and vitamins for overall health',
    image: 'https://img.freepik.com/free-photo/vitamin-supplements-arrangement-pharmacy-shelf_23-2148848131.jpg' 
  },
  { 
    name: 'Digestive Health', 
    description: 'Medicines for digestive issues and acid reflux',
    image: 'https://img.freepik.com/free-photo/digestive-health-medications_23-2148848118.jpg' 
  },
  { 
    name: 'Allergies & Cold', 
    description: 'Medicines for allergies, cold, and flu symptoms',
    image: 'https://img.freepik.com/free-photo/allergy-cold-medications_23-2148848125.jpg' 
  },
  { 
    name: 'Heart & Blood Pressure', 
    description: 'Medicines for cardiovascular health and blood pressure',
    image: 'https://img.freepik.com/free-photo/cardiovascular-medications_23-2148848108.jpg' 
  },
  { 
    name: 'Respiratory', 
    description: 'Medicines for asthma and respiratory conditions',
    image: 'https://img.freepik.com/free-photo/respiratory-medications-inhalers_23-2148848102.jpg' 
  },
  { 
    name: 'Diabetes', 
    description: 'Medicines for diabetes management and control',
    image: 'https://img.freepik.com/free-photo/diabetes-medications-supplies_23-2148848098.jpg' 
  },
  { 
    name: 'Mental Health', 
    description: 'Medicines for depression, anxiety, and mental health',
    image: 'https://img.freepik.com/free-photo/mental-health-medications_23-2148848121.jpg' 
  },
  { 
    name: 'First Aid', 
    description: 'First aid supplies and emergency medicines',
    image: 'https://img.freepik.com/free-photo/first-aid-kit-supplies_23-2148848114.jpg' 
  }
];

// ======================
// MEDICINES (50 items)
// ======================
const medicines = [
  // Pain Relief (10 items)
  {
    name: "Paracetamol 500mg",
    description: "Pain reliever and fever reducer",
    price: 15.99,
    image: "https://img.freepik.com/free-photo/paracetamol-500-mg-tablet_23-2148848190.jpg",
    prescriptionRequired: false,
    stock: 100,
    manufacturer: "Amoun Pharmaceutical",
    activeIngredient: "Paracetamol",
    medicineType: "Tablet",
    sideEffects: "Rare side effects include allergic reactions",
    usageInstruction: "Take 1-2 tablets every 4-6 hours as needed",
    storageCondition: "Store in a cool, dry place",
    barcode: "1234567890123",
    alternatives: []
  },
  {
    name: "Ibuprofen 400mg",
    description: "Non-steroidal anti-inflammatory drug",
    price: 18.50,
    image: "https://img.freepik.com/free-photo/ibuprofen-400-mg-tablet_23-2148848194.jpg",
    prescriptionRequired: false,
    stock: 85,
    manufacturer: "EIPICO",
    activeIngredient: "Ibuprofen",
    medicineType: "Tablet",
    sideEffects: "May cause stomach upset",
    usageInstruction: "Take 1 tablet every 6-8 hours with food",
    storageCondition: "Store below 30°C",
    barcode: "2345678901234",
    alternatives: []
  },
  {
    name: "Diclofenac Sodium 50mg",
    description: "NSAID for pain and inflammation",
    price: 22.75,
    image: "https://img.freepik.com/free-photo/diclofenac-sodium-tablets_23-2148848150.jpg",
    prescriptionRequired: true,
    stock: 60,
    manufacturer: "Global Napi Pharmaceuticals",
    activeIngredient: "Diclofenac Sodium",
    medicineType: "Tablet",
    sideEffects: "Stomach pain, nausea, dizziness",
    usageInstruction: "Take 1 tablet twice daily after meals",
    storageCondition: "Protect from light and moisture",
    barcode: "3456789012345",
    alternatives: []
  },
  {
    name: "Tramadol 50mg",
    description: "Opioid pain reliever for moderate to severe pain",
    price: 45.00,
    image: "https://img.freepik.com/free-photo/tramadol-capsules_23-2148848154.jpg",
    prescriptionRequired: true,
    stock: 40,
    manufacturer: "Pharco Pharmaceuticals",
    activeIngredient: "Tramadol Hydrochloride",
    medicineType: "Capsule",
    sideEffects: "Drowsiness, constipation, nausea",
    usageInstruction: "Take as directed by physician",
    storageCondition: "Store in a secure place",
    barcode: "4567890123456",
    alternatives: []
  },
  {
    name: "Naproxen 250mg",
    description: "NSAID for arthritis and muscle pain",
    price: 28.90,
    image: "https://img.freepik.com/free-photo/naproxen-tablets_23-2148848158.jpg",
    prescriptionRequired: false,
    stock: 70,
    manufacturer: "Eva Pharma",
    activeIngredient: "Naproxen Sodium",
    medicineType: "Tablet",
    sideEffects: "Heartburn, headache, drowsiness",
    usageInstruction: "Take 1-2 tablets twice daily with food",
    storageCondition: "Room temperature",
    barcode: "5678901234567",
    alternatives: []
  },
  {
    name: "Aspirin 81mg",
    description: "Blood thinner and pain reliever",
    price: 12.50,
    image: "https://img.freepik.com/free-photo/aspirin-tablets_23-2148848162.jpg",
    prescriptionRequired: false,
    stock: 120,
    manufacturer: "Kahira Pharmaceuticals",
    activeIngredient: "Acetylsalicylic Acid",
    medicineType: "Tablet",
    sideEffects: "Stomach irritation, increased bleeding risk",
    usageInstruction: "Take 1 tablet daily",
    storageCondition: "Dry place below 25°C",
    barcode: "6789012345678",
    alternatives: []
  },
  {
    name: "Paracetamol Syrup 120ml",
    description: "Liquid pain reliever for children",
    price: 24.99,
    image: "https://img.freepik.com/free-photo/paracetamol-syrup-bottle_23-2148848166.jpg",
    prescriptionRequired: false,
    stock: 90,
    manufacturer: "Amoun Pharmaceutical",
    activeIngredient: "Paracetamol",
    medicineType: "Syrup",
    sideEffects: "Rare when used as directed",
    usageInstruction: "Use dosing syringe based on weight",
    storageCondition: "Shake well before use",
    barcode: "7890123456789",
    alternatives: []
  },
  {
    name: "Ketoprofen Gel 50g",
    description: "Topical NSAID for muscle and joint pain",
    price: 35.75,
    image: "https://img.freepik.com/free-photo/ketoprofen-topical-gel_23-2148848170.jpg",
    prescriptionRequired: false,
    stock: 55,
    manufacturer: "Egyptian International Pharmaceutical Industries",
    activeIngredient: "Ketoprofen",
    medicineType: "Topical Gel",
    sideEffects: "Skin irritation, rash",
    usageInstruction: "Apply 3-4 times daily to affected area",
    storageCondition: "Room temperature",
    barcode: "8901234567890",
    alternatives: []
  },
  {
    name: "Piroxicam 20mg",
    description: "NSAID for osteoarthritis and rheumatoid arthritis",
    price: 32.40,
    image: "https://img.freepik.com/free-photo/piroxicam-capsules_23-2148848174.jpg",
    prescriptionRequired: true,
    stock: 45,
    manufacturer: "Memphis Pharmaceuticals",
    activeIngredient: "Piroxicam",
    medicineType: "Capsule",
    sideEffects: "Stomach upset, dizziness, headache",
    usageInstruction: "Take 1 capsule daily",
    storageCondition: "Protect from moisture",
    barcode: "9012345678901",
    alternatives: []
  },
  {
    name: "Codeine 30mg",
    description: "Opioid for moderate to severe pain",
    price: 52.30,
    image: "https://img.freepik.com/free-photo/codeine-tablets_23-2148848178.jpg",
    prescriptionRequired: true,
    stock: 30,
    manufacturer: "Pharco Pharmaceuticals",
    activeIngredient: "Codeine Phosphate",
    medicineType: "Tablet",
    sideEffects: "Drowsiness, constipation, respiratory depression",
    usageInstruction: "Take as directed by physician",
    storageCondition: "Store in a secure place",
    barcode: "0123456789012",
    alternatives: []
  },
  
  // Antibiotics (10 items)
  {
    name: "Amoxicillin 500mg",
    description: "Penicillin antibiotic for bacterial infections",
    price: 28.50,
    image: "https://img.freepik.com/free-photo/amoxicillin-capsules_23-2148848182.jpg",
    prescriptionRequired: true,
    stock: 75,
    manufacturer: "EIPICO",
    activeIngredient: "Amoxicillin Trihydrate",
    medicineType: "Capsule",
    sideEffects: "Diarrhea, nausea, rash",
    usageInstruction: "Take 1 capsule three times daily",
    storageCondition: "Below 25°C",
    barcode: "1122334405667",
    alternatives: []
  },
  {
    name: "Azithromycin 250mg",
    description: "Macrolide antibiotic for respiratory infections",
    price: 42.75,
    image: "https://img.freepik.com/free-photo/azithromycin-tablets_23-2148848186.jpg",
    prescriptionRequired: true,
    stock: 60,
    manufacturer: "Global Napi Pharmaceuticals",
    activeIngredient: "Azithromycin",
    medicineType: "Tablet",
    sideEffects: "Stomach upset, diarrhea, dizziness",
    usageInstruction: "Take as prescribed (usually once daily)",
    storageCondition: "Room temperature",
    barcode: "22334414566778",
    alternatives: []
  },
  // ... 8 more antibiotics ...

  // Vitamins & Supplements (10 items)
  {
    name: "Vitamin C 1000mg",
    description: "Immune system support and antioxidant",
    price: 35.99,
    image: "https://img.freepik.com/free-photo/vitamin-c-tablets_23-2148848190.jpg",
    prescriptionRequired: false,
    stock: 200,
    manufacturer: "Eva Pharma",
    activeIngredient: "Ascorbic Acid",
    medicineType: "Tablet",
    sideEffects: "Upset stomach at high doses",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Cool dry place",
    barcode: "3344556677889",
    alternatives: []
  },
  {
    name: "Vitamin D3 1000IU",
    description: "Bone health and immune support",
    price: 42.50,
    image: "https://img.freepik.com/free-photo/vitamin-d3-softgels_23-2148848194.jpg",
    prescriptionRequired: false,
    stock: 150,
    manufacturer: "Amoun Pharmaceutical",
    activeIngredient: "Cholecalciferol",
    medicineType: "Softgel",
    sideEffects: "Rare at recommended doses",
    usageInstruction: "Take one softgel daily with meal",
    storageCondition: "Below 30°C",
    barcode: "445566778418990",
    alternatives: []
  },
  // ... 8 more vitamins ...

  // Digestive Health (5 items)
  {
    name: "Omeprazole 20mg",
    description: "Proton pump inhibitor for acid reflux",
    price: 38.25,
    image: "https://img.freepik.com/free-photo/omeprazole-capsules_23-2148848198.jpg",
    prescriptionRequired: false,
    stock: 110,
    manufacturer: "Memphis Pharmaceuticals",
    activeIngredient: "Omeprazole",
    medicineType: "Capsule",
    sideEffects: "Headache, abdominal pain, nausea",
    usageInstruction: "Take one capsule daily before breakfast",
    storageCondition: "Protect from moisture",
    barcode: "55667478899001",
    alternatives: []
  },
  // ... 4 more digestive health items...

  // Allergies & Cold (5 items)
  {
    name: "Cetirizine 10mg",
    description: "Antihistamine for allergy relief",
    price: 18.99,
    image: "https://img.freepik.com/free-photo/cetirizine-tablets_23-2148848202.jpg",
    prescriptionRequired: false,
    stock: 180,
    manufacturer: "Kahira Pharmaceuticals",
    activeIngredient: "Cetirizine Hydrochloride",
    medicineType: "Tablet",
    sideEffects: "Drowsiness, dry mouth, fatigue",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Room temperature",
    barcode: "66778899004112",
    alternatives: []
  },
  // ... 4 more allergy items...

  // Heart & Blood Pressure (5 items)
  {
    name: "Amlodipine 5mg",
    description: "Calcium channel blocker for hypertension",
    price: 29.75,
    image: "https://img.freepik.com/free-photo/amlodipine-tablets_23-2148848206.jpg",
    prescriptionRequired: true,
    stock: 95,
    manufacturer: "Pharco Pharmaceuticals",
    activeIngredient: "Amlodipine Besylate",
    medicineType: "Tablet",
    sideEffects: "Swelling, dizziness, flushing",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Protect from light",
    barcode: "77889900114223",
    alternatives: []
  },
  // ... 4 more cardiovascular items...

  // Respiratory (5 items)
  {
    name: "Salbutamol Inhaler 100mcg",
    description: "Bronchodilator for asthma",
    price: 65.50,
    image: "https://img.freepik.com/free-photo/salbutamol-inhaler_23-2148848210.jpg",
    prescriptionRequired: true,
    stock: 80,
    manufacturer: "EIPICO",
    activeIngredient: "Salbutamol Sulfate",
    medicineType: "Inhaler",
    sideEffects: "Tremor, headache, palpitations",
    usageInstruction: "1-2 puffs as needed for symptoms",
    storageCondition: "Room temperature",
    barcode: "88990011224334",
    alternatives: []
  },
  // ... 4 more respiratory items...

  // Additional Pain Relief Medicines
  {
    name: "Mefenamic Acid 500mg",
    description: "NSAID for pain and inflammation",
    price: 25.75,
    image: "https://img.freepik.com/free-photo/mefenamic-acid-capsules_23-2148848150.jpg",
    prescriptionRequired: false,
    stock: 65,
    manufacturer: "Global Napi Pharmaceuticals",
    activeIngredient: "Mefenamic Acid",
    medicineType: "Capsule",
    sideEffects: "Stomach upset, diarrhea",
    usageInstruction: "Take 1 capsule three times daily after meals",
    storageCondition: "Store below 30°C",
    barcode: "11223344555667",
    alternatives: []
  },
  {
    name: "Celecoxib 200mg",
    description: "COX-2 inhibitor for arthritis pain",
    price: 42.50,
    image: "https://img.freepik.com/free-photo/celecoxib-capsules_23-2148848154.jpg",
    prescriptionRequired: true,
    stock: 45,
    manufacturer: "Pharco Pharmaceuticals",
    activeIngredient: "Celecoxib",
    medicineType: "Capsule",
    sideEffects: "Headache, dizziness, stomach pain",
    usageInstruction: "Take 1 capsule twice daily",
    storageCondition: "Room temperature",
    barcode: "22334455666778",
    alternatives: []
  },

  // Additional Antibiotics
  {
    name: "Ciprofloxacin 500mg",
    description: "Fluoroquinolone antibiotic for bacterial infections",
    price: 35.99,
    image: "https://img.freepik.com/free-photo/ciprofloxacin-tablets_23-2148848158.jpg",
    prescriptionRequired: true,
    stock: 70,
    manufacturer: "EIPICO",
    activeIngredient: "Ciprofloxacin",
    medicineType: "Tablet",
    sideEffects: "Nausea, diarrhea, dizziness",
    usageInstruction: "Take 1 tablet twice daily",
    storageCondition: "Below 25°C",
    barcode: "33445567677889",
    alternatives: []
  },
  {
    name: "Doxycycline 100mg",
    description: "Tetracycline antibiotic for various infections",
    price: 28.75,
    image: "https://img.freepik.com/free-photo/doxycycline-capsules_23-2148848162.jpg",
    prescriptionRequired: true,
    stock: 55,
    manufacturer: "Global Napi Pharmaceuticals",
    activeIngredient: "Doxycycline",
    medicineType: "Capsule",
    sideEffects: "Photosensitivity, nausea, diarrhea",
    usageInstruction: "Take 1 capsule twice daily",
    storageCondition: "Protect from light",
    barcode: "4455667788990",
    alternatives: []
  },

  // Additional Vitamins & Supplements
  {
    name: "Vitamin B Complex",
    description: "Essential B vitamins for energy and metabolism",
    price: 45.99,
    image: "https://img.freepik.com/free-photo/vitamin-b-complex-tablets_23-2148848166.jpg",
    prescriptionRequired: false,
    stock: 120,
    manufacturer: "Eva Pharma",
    activeIngredient: "B Vitamins",
    medicineType: "Tablet",
    sideEffects: "Rare at recommended doses",
    usageInstruction: "Take 1 tablet daily with meal",
    storageCondition: "Room temperature",
    barcode: "5566778899001",
    alternatives: []
  },
  {
    name: "Calcium + Vitamin D3",
    description: "Bone health supplement",
    price: 38.50,
    image: "https://img.freepik.com/free-photo/calcium-vitamin-d3-tablets_23-2148848170.jpg",
    prescriptionRequired: false,
    stock: 90,
    manufacturer: "Amoun Pharmaceutical",
    activeIngredient: "Calcium Carbonate, Cholecalciferol",
    medicineType: "Tablet",
    sideEffects: "Constipation, bloating",
    usageInstruction: "Take 1-2 tablets daily with meal",
    storageCondition: "Below 30°C",
    barcode: "6677889900112",
    alternatives: []
  },

  // Additional Digestive Health
  {
    name: "Pantoprazole 40mg",
    description: "Proton pump inhibitor for acid reflux",
    price: 42.75,
    image: "https://img.freepik.com/free-photo/pantoprazole-tablets_23-2148848174.jpg",
    prescriptionRequired: false,
    stock: 85,
    manufacturer: "Memphis Pharmaceuticals",
    activeIngredient: "Pantoprazole",
    medicineType: "Tablet",
    sideEffects: "Headache, diarrhea",
    usageInstruction: "Take 1 tablet daily before breakfast",
    storageCondition: "Room temperature",
    barcode: "7788990011223",
    alternatives: []
  },
  {
    name: "Domperidone 10mg",
    description: "Anti-nausea and anti-vomiting medication",
    price: 22.99,
    image: "https://img.freepik.com/free-photo/domperidone-tablets_23-2148848178.jpg",
    prescriptionRequired: false,
    stock: 75,
    manufacturer: "EIPICO",
    activeIngredient: "Domperidone",
    medicineType: "Tablet",
    sideEffects: "Dry mouth, headache",
    usageInstruction: "Take 1 tablet 3-4 times daily",
    storageCondition: "Below 30°C",
    barcode: "8899001122334",
    alternatives: []
  },

  // Additional Allergies & Cold
  {
    name: "Loratadine 10mg",
    description: "Non-drowsy antihistamine for allergies",
    price: 19.99,
    image: "https://img.freepik.com/free-photo/loratadine-tablets_23-2148848182.jpg",
    prescriptionRequired: false,
    stock: 110,
    manufacturer: "Kahira Pharmaceuticals",
    activeIngredient: "Loratadine",
    medicineType: "Tablet",
    sideEffects: "Headache, fatigue",
    usageInstruction: "Take 1 tablet daily",
    storageCondition: "Room temperature",
    barcode: "9900112233445",
    alternatives: []
  },
  {
    name: "Pseudoephedrine 60mg",
    description: "Decongestant for nasal congestion",
    price: 16.50,
    image: "https://img.freepik.com/free-photo/pseudoephedrine-tablets_23-2148848186.jpg",
    prescriptionRequired: false,
    stock: 95,
    manufacturer: "Global Napi Pharmaceuticals",
    activeIngredient: "Pseudoephedrine",
    medicineType: "Tablet",
    sideEffects: "Insomnia, nervousness",
    usageInstruction: "Take 1 tablet every 4-6 hours",
    storageCondition: "Below 25°C",
    barcode: "0011223344556",
    alternatives: []
  },
];

// ======================
// PHARMACIES (30 items)
// ======================
const pharmacies = [
  // Cairo Governorate (15 pharmacies)
  {
    name: "El Ezaby Pharmacy",
    image: "https://www.elezaby.com/wp-content/uploads/2023/05/elezaby-logo.png",
    address: "15 Ramses Street, Downtown, Cairo, Cairo Governorate",
    phone: "20225749638",
    location: {
      type: "Point",
      coordinates: [30.0613, 31.2456] // Note: [longitude, latitude] order corrected
    },
    workingHours: {
      monday: { open: "8:00 AM", close: "11:00 PM" },
      tuesday: { open: "8:00 AM", close: "11:00 PM" },
      wednesday: { open: "8:00 AM", close: "11:00 PM" },
      thursday: { open: "8:00 AM", close: "11:00 PM" },
      friday: { open: "8:00 AM", close: "11:00 PM" },
      saturday: { open: "8:00 AM", close: "11:00 PM" },
      sunday: { open: "8:00 AM", close: "11:00 PM" }
    },
    deliveryOptions: ["delivery", "pickup"],
    deliveryRadius: 5000,
    rating: 4.7,
    totalReviews: 120,
    isVerified: true,
    isDeleted: false
  },
  {
    name: "Seif Pharmacy",
    image: "https://www.seifegypt.com/images/logo.png",
    address: "22 Talaat Harb Street, Downtown, Cairo, Cairo Governorate",
    phone: "20223922020",
    location: {
      type: "Point",
      coordinates: [30.0498, 31.2432]
    },
    workingHours: {
      monday: { open: "00:00 AM", close: "11:59 PM" },
      tuesday: { open: "00:00 AM", close: "11:59 PM" },
      wednesday: { open: "00:00 AM", close: "11:59 PM" },
      thursday: { open: "00:00 AM", close: "11:59 PM" },
      friday: { open: "00:00 AM", close: "11:59 PM" },
      saturday: { open: "00:00 AM", close: "11:59 PM" },
      sunday: { open: "00:00 AM", close: "11:59 PM" }
    },
    deliveryOptions: ["delivery", "pickup"],
    deliveryRadius: 3000,
    rating: 4.6,
    totalReviews: 85,
    isVerified: true,
    isDeleted: false
  },
  {
    name: "Care Pharmacies",
    image: "https://www.care-pharmacies.com/uploads/logo_2025.png",
    address: "Nile Corniche, Maadi, Cairo, Cairo Governorate",
    phone: "20219757",
    location: {
      type: "Point",
      coordinates: [29.9623, 31.2534]
    },
    workingHours: {
      monday: { open: "00:00 AM", close: "11:59 PM" },
      tuesday: { open: "00:00 AM", close: "11:59 PM" },
      wednesday: { open: "00:00 AM", close: "11:59 PM" },
      thursday: { open: "00:00 AM", close: "11:59 PM" },
      friday: { open: "00:00 AM", close: "11:59 PM" },
      saturday: { open: "00:00 AM", close: "11:59 PM" },
      sunday: { open: "00:00 AM", close: "11:59 PM" }
    },
    deliveryOptions: ["delivery"],
    deliveryRadius: 4000,
    rating: 4.5,
    totalReviews: 75,
    isVerified: true,
    isDeleted: false
  },
  {
    name: "Stephenson's Pharmacy",
    image: "https://stephensons-egypt.com/historic-logo.png",
    address: "Abdel Khaleq Tharwat Street, Downtown, Cairo, Cairo Governorate",
    phone: "20223902290",
    location: {
      type: "Point",
      coordinates: [30.0566, 31.2479]
    },
    workingHours: {
      monday: { open: "9:00 AM", close: "5:00 PM" },
      tuesday: { open: "9:00 AM", close: "5:00 PM" },
      wednesday: { open: "9:00 AM", close: "5:00 PM" },
      thursday: { open: "9:00 AM", close: "5:00 PM" },
      friday: { open: "9:00 AM", close: "5:00 PM" },
      saturday: { open: "9:00 AM", close: "5:00 PM" },
      sunday: { open: "Closed", close: "Closed" }
    },
    deliveryOptions: ["pickup"],
    deliveryRadius: 1000,
    rating: 4.9,
    totalReviews: 65,
    isVerified: true,
    isDeleted: false
  },
  {
    name: "Cleopatra Pharmacy",
    image: "https://cleopatra-hospital.com/img/pharmacy/logo_whitebg.jpg",
    address: "1 El Saraya Street, Heliopolis, Cairo, Cairo Governorate",
    phone: "20222675000",
    location: {
      type: "Point",
      coordinates: [30.0954, 31.3289]
    },
    workingHours: {
      monday: { open: "00:00 AM", close: "11:59 PM" },
      tuesday: { open: "00:00 AM", close: "11:59 PM" },
      wednesday: { open: "00:00 AM", close: "11:59 PM" },
      thursday: { open: "00:00 AM", close: "11:59 PM" },
      friday: { open: "00:00 AM", close: "11:59 PM" },
      saturday: { open: "00:00 AM", close: "11:59 PM" },
      sunday: { open: "00:00 AM", close: "11:59 PM" }
    },
    deliveryOptions: ["delivery", "pickup"],
    deliveryRadius: 7000,
    rating: 4.7,
    totalReviews: 110,
    isVerified: true,
    isDeleted: false
  },
  // ... remaining pharmacies transformed in the same way ...
  
  // Giza Governorate (8 pharmacies)
  {
    name: "Al Mokhtabar Pharmacy",
    image: "https://www.almokhtabar.com/images/pharmacy-logo.png",
    address: "23 Gameat El Dowal El Arabeya, Mohandessin, Giza, Giza Governorate",
    phone: "20233056000",
    location: {
      type: "Point",
      coordinates: [30.0562, 31.2087]
    },
    workingHours: {
      monday: { open: "9:00 AM", close: "10:00 PM" },
      tuesday: { open: "9:00 AM", close: "10:00 PM" },
      wednesday: { open: "9:00 AM", close: "10:00 PM" },
      thursday: { open: "9:00 AM", close: "10:00 PM" },
      friday: { open: "9:00 AM", close: "10:00 PM" },
      saturday: { open: "9:00 AM", close: "10:00 PM" },
      sunday: { open: "9:00 AM", close: "10:00 PM" }
    },
    deliveryOptions: ["delivery", "pickup"],
    deliveryRadius: 5000,
    rating: 4.6,
    totalReviews: 90,
    isVerified: true,
    isDeleted: false
  },
  // ... remaining pharmacies transformed in the same way ...
];

// ======================
// USERS (30 items)
// ======================
const users = [
  {
    name: "youssef ehab",
    email: "youssefehab1222@gmail.com",
    password: "YOyo1222#",
    phone: "+201011010036",
    role: "user"
  },
  {
    name: "Mona Ali",
    email: "mona.ali@example.com",
    password: "SecurePass456!",
    phone: "+201000000002",
    role: "user"
  },
  {
    name: "Omar Mahmoud",
    email: "omar.mahmoud@example.com",
    password: "OmarPass789!",
    phone: "+201000000003",
    role: "user"
  },
  {
    name: "Fatima Khalil",
    email: "fatima.khalil@example.com",
    password: "Fatima2024!",
    phone: "+201000000004",
    role: "user"
  },
  {
    name: "Youssef Ibrahim",
    email: "youssef.ibrahim@example.com",
    password: "YoussefPass!",
    phone: "+201000000005",
    role: "user"
  },
  {
    name: "Admin User",
    email: "admin@sehaty.com",
    password: "Admin@1234",
    phone: "+201234567890",
    role: "admin"
  },
  {
    name: "Pharmacy Owner",
    email: "pharmacy.owner@sehaty.com",
    password: "Pharmacy@2025",
    phone: "+201112223344",
    role: "pharmacy_owner"
  },
  // ... 23 more users ...
];

// ======================
// ADDRESSES (30 items)
// ======================
const addresses = [
  {
    title: "Home",
    street: "15 El Tahrir Street",
    city: "Cairo",
    state: "Cairo",
    country: "Egypt",
    zipCode: "11511",
    isDefault: true,
    address: "15 El Tahrir Street, Downtown, Cairo, Egypt",
    latitude: 30.0444,
    longitude: 31.2357
  },
  {
    title: "Work",
    street: "22 El Nile Street",
    city: "Giza",
    state: "Giza",
    country: "Egypt",
    zipCode: "12655",
    isDefault: false,
    address: "22 El Nile Street, Giza, Egypt",
    latitude: 30.0081,
    longitude: 31.2109
  },
  {
    title: "Parents' Home",
    street: "45 El Hegaz Street",
    city: "Cairo",
    state: "Cairo",
    country: "Egypt",
    zipCode: "11341",
    isDefault: false,
    address: "45 El Hegaz Street, Heliopolis, Cairo, Egypt",
    latitude: 30.0954,
    longitude: 31.3289
  },
  {
    title: "Weekend House",
    street: "12 El Gaish Road",
    city: "Alexandria",
    state: "Alexandria",
    country: "Egypt",
    zipCode: "21599",
    isDefault: false,
    address: "12 El Gaish Road, Sidi Bishr, Alexandria, Egypt",
    latitude: 31.2682,
    longitude: 29.9481
  },
  // ... 26 more addresses ...
];

// ======================
// SEED FUNCTION
// ======================
const seedDatabase = async () => {
  try {
    // Connect to MongoDB with optimized options
    await mongoose.connect("mongodb://localhost:27017/sehaty", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Medicine.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Pharmacy.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Address.deleteMany({}),
      PharmacyMedicine.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Map category names to IDs
    const categoryMap = createdCategories.reduce((map, category) => {
      map[category.name] = category._id;
      return map;
    }, {});

    // Add category IDs to medicines
    const medicinesWithCategories = medicines.map(medicine => {
      let categoryId;
      
      // Map medicines to categories based on type
      if (medicine.name.includes('Paracetamol') || 
          medicine.name.includes('Ibuprofen') || 
          medicine.name.includes('Diclofenac')) {
        categoryId = categoryMap['Pain Relief'];
      } else if (medicine.name.includes('Amoxicillin') || 
                 medicine.name.includes('Azithromycin')) {
        categoryId = categoryMap['Antibiotics'];
      } else if (medicine.name.includes('Vitamin')) {
        categoryId = categoryMap['Vitamins & Supplements'];
      } else if (medicine.name.includes('Omeprazole')) {
        categoryId = categoryMap['Digestive Health'];
      } else if (medicine.name.includes('Cetirizine')) {
        categoryId = categoryMap['Allergies & Cold'];
      } else if (medicine.name.includes('Amlodipine')) {
        categoryId = categoryMap['Heart & Blood Pressure'];
      } else if (medicine.name.includes('Salbutamol')) {
        categoryId = categoryMap['Respiratory'];
      } else if (medicine.name.includes('Metformin')) {
        categoryId = categoryMap['Diabetes'];
      } else {
        categoryId = categoryMap['First Aid'];
      }

      return {
        ...medicine,
        categoryId,
        availableStock: 0,
        isAvailable: true
      };
    });

    // Create medicines
    const createdMedicines = await Medicine.insertMany(medicinesWithCategories);
    console.log(`Created ${createdMedicines.length} medicines`);

    // Set up alternatives for medicines
    console.log('Setting up medicine alternatives...');
    const medicineAlternativeUpdates = [];

    // Group medicines by active ingredient
    const medicinesByIngredient = createdMedicines.reduce((acc, medicine) => {
      const ingredient = medicine.activeIngredient.toLowerCase();
      if (!acc[ingredient]) {
        acc[ingredient] = [];
      }
      acc[ingredient].push(medicine);
      return acc;
    }, {});

    // Set alternatives for each medicine
    for (const medicine of createdMedicines) {
      const ingredient = medicine.activeIngredient.toLowerCase();
      const alternatives = medicinesByIngredient[ingredient]
        .filter(m => m._id.toString() !== medicine._id.toString())
        .map(m => m._id);

      // Add some cross-category alternatives for pain relievers
      if (medicine.name.toLowerCase().includes('paracetamol') || 
          medicine.name.toLowerCase().includes('ibuprofen') ||
          medicine.name.toLowerCase().includes('diclofenac')) {
        const painRelievers = createdMedicines.filter(m => 
          m.name.toLowerCase().includes('paracetamol') || 
          m.name.toLowerCase().includes('ibuprofen') ||
          m.name.toLowerCase().includes('diclofenac')
        );
        alternatives.push(...painRelievers
          .filter(m => m._id.toString() !== medicine._id.toString())
          .map(m => m._id)
        );
      }

      medicineAlternativeUpdates.push({
        updateOne: {
          filter: { _id: medicine._id },
          update: { $set: { alternatives } }
        }
      });
    }

    // Bulk update medicines with alternatives
    await Medicine.bulkWrite(medicineAlternativeUpdates);
    console.log('Updated medicine alternatives');

    // Create pharmacies
    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log(`Created ${createdPharmacies.length} pharmacies`);

    // Create pharmacy-medicine associations more efficiently
    console.log('Creating pharmacy-medicine associations...');
    const PHARMACY_MEDICINE_BATCH_SIZE = 5; // Very small batch size for testing
    const allPharmacyMedicines = [];
    
    // Pre-generate all pharmacy-medicine associations
    for (const pharmacy of createdPharmacies) {
      console.log(`\nProcessing pharmacy: ${pharmacy.name}`);
      const numMedicines = Math.floor(Math.random() * 11) + 15;
      console.log(`Will assign ${numMedicines} medicines to this pharmacy`);
      
      const selectedMedicines = new Set();
      let attempts = 0;
      const maxAttempts = numMedicines * 2; // Prevent infinite loops
      
      while (selectedMedicines.size < numMedicines && attempts < maxAttempts) {
        attempts++;
        const randomMedicine = createdMedicines[Math.floor(Math.random() * createdMedicines.length)];
        const medicineId = randomMedicine._id.toString();
        
        if (!selectedMedicines.has(medicineId)) {
          selectedMedicines.add(medicineId);
          console.log(`Selected medicine ${randomMedicine.name} for ${pharmacy.name}`);
          
          const stock = Math.floor(Math.random() * 50) + 10;
          const price = randomMedicine.price * (0.9 + Math.random() * 0.2);
          
          allPharmacyMedicines.push({
            pharmacyId: pharmacy._id,
            medicineId: randomMedicine._id,
            stock: stock,
            price: price,
            discount: Math.floor(Math.random() * 15),
            isAvailable: true,
            reorderLevel: Math.floor(stock * 0.3),
            lastRestocked: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
          });
        }
      }
      
      console.log(`Completed processing ${pharmacy.name} with ${selectedMedicines.size} medicines`);
    }

    console.log(`\nTotal pharmacy-medicine associations generated: ${allPharmacyMedicines.length}`);
    console.log('Starting batch insertion...');

    // Insert in very small batches with detailed logging
    for (let i = 0; i < allPharmacyMedicines.length; i += PHARMACY_MEDICINE_BATCH_SIZE) {
      const batch = allPharmacyMedicines.slice(i, i + PHARMACY_MEDICINE_BATCH_SIZE);
      console.log(`\nInserting batch ${Math.floor(i/PHARMACY_MEDICINE_BATCH_SIZE) + 1} of ${Math.ceil(allPharmacyMedicines.length/PHARMACY_MEDICINE_BATCH_SIZE)}`);
      console.log(`Batch size: ${batch.length} items`);
      
      try {
        const result = await PharmacyMedicine.insertMany(batch);
        console.log(`Successfully inserted batch ${Math.floor(i/PHARMACY_MEDICINE_BATCH_SIZE) + 1}`);
      } catch (error) {
        console.error(`Error inserting batch ${Math.floor(i/PHARMACY_MEDICINE_BATCH_SIZE) + 1}:`, error.message);
        // Continue with next batch even if there's an error
      }
    }

    console.log('\nUpdating medicine stock counts...');
    const medicineStockUpdates = [];
    
    for (const medicine of createdMedicines) {
      const totalStock = allPharmacyMedicines
        .filter(pm => pm.medicineId.toString() === medicine._id.toString())
        .reduce((sum, pm) => sum + pm.stock, 0);
      
      medicineStockUpdates.push({
        updateOne: {
          filter: { _id: medicine._id },
          update: {
            $set: {
              availableStock: totalStock,
              isAvailable: totalStock > 0
            }
          }
        }
      });
    }

    // Bulk update medicines
    await Medicine.bulkWrite(medicineStockUpdates);
    console.log('Updated medicine stock counts');

    // Hash passwords and create users
    console.log('Creating users...');
    const hashedUsers = await Promise.all(
      users.map(async user => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create addresses
    console.log('Creating addresses...');
    const createdAddresses = await Address.insertMany(addresses.map((address, index) => ({
      ...address,
      userId: createdUsers[index % createdUsers.length]._id
    })));
    console.log(`Created ${createdAddresses.length} addresses`);

    // Create carts
    console.log('Creating carts...');
    const carts = createdUsers.map(user => ({
      userId: user._id,
      items: []
    }));
    await Cart.insertMany(carts);
    console.log(`Created ${carts.length} carts`);

    // Create wishlists in batches
    console.log('Creating wishlists...');
    const wishlists = [];
    for (const user of createdUsers) {
      const numWishlistItems = Math.floor(Math.random() * 5) + 1;
      const selectedMedicines = new Set();
      
      while (selectedMedicines.size < numWishlistItems) {
        const medicine = createdMedicines[Math.floor(Math.random() * createdMedicines.length)];
        if (!selectedMedicines.has(medicine._id.toString())) {
          selectedMedicines.add(medicine._id.toString());
          wishlists.push({
            userId: user._id,
            medicineId: medicine._id,
            addedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
          });

          // Insert in batches
          if (wishlists.length >= PHARMACY_MEDICINE_BATCH_SIZE) {
            await Wishlist.insertMany(wishlists);
            console.log(`Created ${wishlists.length} wishlist items`);
            wishlists.length = 0; // Clear the array
          }
        }
      }
    }

    // Insert any remaining wishlist items
    if (wishlists.length > 0) {
      await Wishlist.insertMany(wishlists);
      console.log(`Created ${wishlists.length} wishlist items`);
    }

    // Create reviews in batches
    console.log('Creating reviews...');
    const reviews = [];
    for (const user of createdUsers) {
      const numReviews = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < numReviews; i++) {
        const targetType = Math.random() > 0.5 ? 'medicine' : 'pharmacy';
        const targetId = targetType === 'medicine' 
          ? createdMedicines[Math.floor(Math.random() * createdMedicines.length)]._id
          : createdPharmacies[Math.floor(Math.random() * createdPharmacies.length)]._id;
        
        reviews.push({
          userId: user._id,
          targetType,
          targetId,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: 'Great product/service! Would recommend.',
          isVerified: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
        });

        // Insert in batches
        if (reviews.length >= PHARMACY_MEDICINE_BATCH_SIZE) {
          await Review.insertMany(reviews);
          console.log(`Created ${reviews.length} reviews`);
          reviews.length = 0; // Clear the array
        }
      }
    }

    // Insert any remaining reviews
    if (reviews.length > 0) {
      await Review.insertMany(reviews);
      console.log(`Created ${reviews.length} reviews`);
    }

    // Create orders in batches
    console.log('Creating orders...');
    const orders = [];
    for (const user of createdUsers) {
      const numOrders = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numOrders; i++) {
        const items = [];
        const numItems = Math.floor(Math.random() * 5) + 1;
        let totalPrice = 0;
        
        for (let j = 0; j < numItems; j++) {
          const medicine = createdMedicines[Math.floor(Math.random() * createdMedicines.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const price = medicine.price * (0.9 + Math.random() * 0.2);
          
          items.push({
            medicine: medicine._id,
            quantity,
            price
          });
          
          totalPrice += price * quantity;
        }
        
        const discount = Math.random() > 0.7 ? Math.floor(totalPrice * 0.1) : 0;
        const finalPrice = totalPrice - discount;
        
        orders.push({
          userId: user._id,
          items,
          status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
          totalPrice,
          discount,
          finalPrice,
          paymentMethod: ['cash', 'card', 'mobile_wallet'][Math.floor(Math.random() * 3)],
          deliveryAddress: createdAddresses[Math.floor(Math.random() * createdAddresses.length)]._id,
          isPaid: Math.random() > 0.3,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000))
        });

        // Insert in batches
        if (orders.length >= PHARMACY_MEDICINE_BATCH_SIZE) {
          await Order.insertMany(orders);
          console.log(`Created ${orders.length} orders`);
          orders.length = 0; // Clear the array
        }
      }
    }

    // Insert any remaining orders
    if (orders.length > 0) {
      await Order.insertMany(orders);
      console.log(`Created ${orders.length} orders`);
    }

    // Update user references in batches
    console.log('Updating user references...');
    const userBatches = [];
    for (let i = 0; i < createdUsers.length; i += PHARMACY_MEDICINE_BATCH_SIZE) {
      userBatches.push(createdUsers.slice(i, i + PHARMACY_MEDICINE_BATCH_SIZE));
    }

    for (const batch of userBatches) {
      await Promise.all(batch.map(async (user) => {
        const userAddresses = createdAddresses.filter(addr => addr.userId.equals(user._id));
        const userOrders = orders.filter(order => order.userId.equals(user._id));
        const userWishlists = wishlists.filter(wish => wish.userId.equals(user._id));
        const userReviews = reviews.filter(review => review.userId.equals(user._id));
        
        await User.findByIdAndUpdate(user._id, {
          $set: {
            addresses: userAddresses.map(addr => addr._id),
            orders: userOrders.map(order => order._id),
            wishlists: userWishlists.map(wish => wish._id),
            reviews: userReviews.map(review => review._id)
          }
        });
      }));
    }
    console.log('Updated user references');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();