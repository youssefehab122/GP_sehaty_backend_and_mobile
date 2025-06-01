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

const categories = [
  { 
    name: 'Pain Relief', 
    description: 'Medicines for pain management and fever reduction',
    image: 'https://example.com/pain-relief.jpg'
  },
  { 
    name: 'Antibiotics', 
    description: 'Medicines for treating bacterial infections',
    image: 'https://example.com/antibiotics.jpg'
  },
  { 
    name: 'Vitamins & Supplements', 
    description: 'Nutritional supplements and vitamins for overall health',
    image: 'https://example.com/vitamins.jpg'
  },
  { 
    name: 'Digestive Health', 
    description: 'Medicines for digestive issues and acid reflux',
    image: 'https://example.com/digestive.jpg'
  },
  { 
    name: 'Allergies & Cold', 
    description: 'Medicines for allergies, cold, and flu symptoms',
    image: 'https://example.com/allergies.jpg'
  },
  { 
    name: 'Heart & Blood Pressure', 
    description: 'Medicines for cardiovascular health and blood pressure',
    image: 'https://example.com/heart.jpg'
  },
  { 
    name: 'Respiratory', 
    description: 'Medicines for asthma and respiratory conditions',
    image: 'https://example.com/respiratory.jpg'
  },
  { 
    name: 'Diabetes', 
    description: 'Medicines for diabetes management and control',
    image: 'https://example.com/diabetes.jpg'
  },
  { 
    name: 'Mental Health', 
    description: 'Medicines for depression, anxiety, and mental health',
    image: 'https://example.com/mental-health.jpg'
  },
  { 
    name: 'First Aid', 
    description: 'First aid supplies and emergency medicines',
    image: 'https://example.com/first-aid.jpg'
  }
];

const medicines = [
  {
    name: "Paracetamol 500mg",
    description: "Pain reliever and fever reducer",
    price: 15.99,
    image: "https://example.com/paracetamol.jpg",
    prescriptionRequired: false,
    stock: 100,
    manufacturer: "ABC Pharma",
    activeIngredient: "Paracetamol",
    medicineType: "Tablet",
    sideEffects: "Rare side effects include allergic reactions",
    usageInstruction: "Take 1-2 tablets every 4-6 hours as needed",
    storageCondition: "Store in a cool, dry place",
    barcode: "1234567890123",
    alternatives: ["682f919260881f1cce8e9d09", "682f919260881f1cce8e9d10"]
  },
  {
    name: "Paracetamol 650mg",
    description: "Stronger pain reliever and fever reducer",
    price: 18.99,
    image: "https://example.com/paracetamol650.jpg",
    prescriptionRequired: false,
    stock: 80,
    manufacturer: "ABC Pharma",
    activeIngredient: "Paracetamol",
    medicineType: "Tablet",
    sideEffects: "Rare side effects include allergic reactions",
    usageInstruction: "Take 1 tablet every 4-6 hours as needed",
    storageCondition: "Store in a cool, dry place",
    barcode: "1234567890124",
    alternatives: ["682f919260881f1cce8e9d08", "682f919260881f1cce8e9d10"]
  },
  {
    name: "Paracetamol Syrup",
    description: "Liquid pain reliever and fever reducer for children",
    price: 12.99,
    image: "https://example.com/paracetamol-syrup.jpg",
    prescriptionRequired: false,
    stock: 120,
    manufacturer: "ABC Pharma",
    activeIngredient: "Paracetamol",
    medicineType: "Syrup",
    sideEffects: "Rare side effects include allergic reactions",
    usageInstruction: "Take as directed based on weight",
    storageCondition: "Store in a cool, dry place",
    barcode: "1234567890125",
    alternatives: ["682f919260881f1cce8e9d08", "682f919260881f1cce8e9d09"]
  },
  {
    name: "Amoxicillin 250mg",
    description: "Antibiotic for bacterial infections",
    price: 25.99,
    image: "https://example.com/amoxicillin.jpg",
    prescriptionRequired: true,
    stock: 50,
    manufacturer: "XYZ Pharma",
    activeIngredient: "Amoxicillin",
    medicineType: "Capsule",
    sideEffects: "May cause diarrhea, nausea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "2345678901234",
    alternatives: ["682f919260881f1cce8e9d11", "682f919260881f1cce8e9d12"]
  },
  {
    name: "Amoxicillin 500mg",
    description: "Stronger antibiotic for bacterial infections",
    price: 32.99,
    image: "https://example.com/amoxicillin500.jpg",
    prescriptionRequired: true,
    stock: 40,
    manufacturer: "XYZ Pharma",
    activeIngredient: "Amoxicillin",
    medicineType: "Capsule",
    sideEffects: "May cause diarrhea, nausea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "2345678901235",
    alternatives: ["682f919260881f1cce8e9d10", "682f919260881f1cce8e9d12"]
  },
  {
    name: "Amoxicillin Syrup",
    description: "Liquid antibiotic for children",
    price: 28.99,
    image: "https://example.com/amoxicillin-syrup.jpg",
    prescriptionRequired: true,
    stock: 60,
    manufacturer: "XYZ Pharma",
    activeIngredient: "Amoxicillin",
    medicineType: "Syrup",
    sideEffects: "May cause diarrhea, nausea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "2345678901236",
    alternatives: ["682f919260881f1cce8e9d10", "682f919260881f1cce8e9d11"]
  },
  {
    name: "Vitamin C 1000mg",
    description: "Immune system support",
    price: 19.99,
    image: "https://example.com/vitaminc.jpg",
    prescriptionRequired: false,
    stock: 200,
    manufacturer: "Health Plus",
    activeIngredient: "Ascorbic Acid",
    medicineType: "Tablet",
    sideEffects: "May cause upset stomach",
    usageInstruction: "Take one tablet daily with food",
    storageCondition: "Store in a cool, dry place",
    barcode: "3456789012345"
  },
  {
    name: "Omeprazole 20mg",
    description: "Proton pump inhibitor for acid reflux",
    price: 29.99,
    image: "https://example.com/omeprazole.jpg",
    prescriptionRequired: false,
    stock: 150,
    manufacturer: "Digestive Health Inc",
    activeIngredient: "Omeprazole",
    medicineType: "Capsule",
    sideEffects: "May cause headache, diarrhea",
    usageInstruction: "Take one capsule daily before breakfast",
    storageCondition: "Store in a cool, dry place",
    barcode: "4567890123456"
  },
  {
    name: "Cetirizine 10mg",
    description: "Antihistamine for allergies",
    price: 12.99,
    image: "https://example.com/cetirizine.jpg",
    prescriptionRequired: false,
    stock: 300,
    manufacturer: "Allergy Relief Pharma",
    activeIngredient: "Cetirizine",
    medicineType: "Tablet",
    sideEffects: "May cause drowsiness",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Store in a cool, dry place",
    barcode: "5678901234567"
  },
  {
    name: "Metformin 500mg",
    description: "Oral diabetes medicine",
    price: 18.99,
    image: "https://example.com/metformin.jpg",
    prescriptionRequired: true,
    stock: 100,
    manufacturer: "Diabetes Care",
    activeIngredient: "Metformin",
    medicineType: "Tablet",
    sideEffects: "May cause gastrointestinal issues",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "6789012345678"
  },
  {
    name: "Sertraline 50mg",
    description: "Antidepressant medication",
    price: 35.99,
    image: "https://example.com/sertraline.jpg",
    prescriptionRequired: true,
    stock: 75,
    manufacturer: "Mental Health Pharma",
    activeIngredient: "Sertraline",
    medicineType: "Tablet",
    sideEffects: "May cause nausea, insomnia",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "7890123456789"
  },
  {
    name: "Salbutamol Inhaler",
    description: "Bronchodilator for asthma",
    price: 22.99,
    image: "https://example.com/salbutamol.jpg",
    prescriptionRequired: true,
    stock: 120,
    manufacturer: "Respiratory Care",
    activeIngredient: "Salbutamol",
    medicineType: "Inhaler",
    sideEffects: "May cause tremors, increased heart rate",
    usageInstruction: "Use as needed for breathing difficulties",
    storageCondition: "Store in a cool, dry place",
    barcode: "8901234567890"
  },
  {
    name: "Atorvastatin 20mg",
    description: "Cholesterol-lowering medication",
    price: 28.99,
    image: "https://example.com/atorvastatin.jpg",
    prescriptionRequired: true,
    stock: 90,
    manufacturer: "Cardio Health",
    activeIngredient: "Atorvastatin",
    medicineType: "Tablet",
    sideEffects: "May cause muscle pain",
    usageInstruction: "Take one tablet daily at bedtime",
    storageCondition: "Store in a cool, dry place",
    barcode: "9012345678901"
  },
  {
    name: "Azithromycin 500mg",
    description: "Antibiotic for bacterial infections",
    price: 32.99,
    image: "https://example.com/azithromycin.jpg",
    prescriptionRequired: true,
    stock: 60,
    manufacturer: "ABC Pharma",
    activeIngredient: "Azithromycin",
    medicineType: "Tablet",
    sideEffects: "May cause diarrhea, nausea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "0123456789012"
  },
  {
    name: "Ibuprofen 400mg",
    description: "Non-steroidal anti-inflammatory drug",
    price: 14.99,
    image: "https://example.com/ibuprofen.jpg",
    prescriptionRequired: false,
    stock: 200,
    manufacturer: "Pain Relief Inc",
    activeIngredient: "Ibuprofen",
    medicineType: "Tablet",
    sideEffects: "May cause stomach upset",
    usageInstruction: "Take 1-2 tablets every 4-6 hours as needed",
    storageCondition: "Store in a cool, dry place",
    barcode: "1234567890126"
  },
  {
    name: "Loratadine 10mg",
    description: "Antihistamine for allergies",
    price: 11.99,
    image: "https://example.com/loratadine.jpg",
    prescriptionRequired: false,
    stock: 250,
    manufacturer: "Allergy Relief Pharma",
    activeIngredient: "Loratadine",
    medicineType: "Tablet",
    sideEffects: "Rare side effects include headache",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Store in a cool, dry place",
    barcode: "2345678901237",
    alternatives: []
  },
  {
    name: "Omeprazole 40mg",
    description: "Proton pump inhibitor for severe acid reflux",
    price: 34.99,
    image: "https://example.com/omeprazole40.jpg",
    prescriptionRequired: true,
    stock: 80,
    manufacturer: "Digestive Health Inc",
    activeIngredient: "Omeprazole",
    medicineType: "Capsule",
    sideEffects: "May cause headache, diarrhea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "3456789012346"
  },
  {
    name: "Metoprolol 50mg",
    description: "Beta blocker for high blood pressure",
    price: 24.99,
    image: "https://example.com/metoprolol.jpg",
    prescriptionRequired: true,
    stock: 110,
    manufacturer: "Cardio Health",
    activeIngredient: "Metoprolol",
    medicineType: "Tablet",
    sideEffects: "May cause fatigue, dizziness",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "4567890123457"
  },
  {
    name: "Fluoxetine 20mg",
    description: "Antidepressant medication",
    price: 30.99,
    image: "https://example.com/fluoxetine.jpg",
    prescriptionRequired: true,
    stock: 85,
    manufacturer: "Mental Health Pharma",
    activeIngredient: "Fluoxetine",
    medicineType: "Capsule",
    sideEffects: "May cause nausea, insomnia",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "5678901234568"
  },
  {
    name: "Montelukast 10mg",
    description: "Leukotriene receptor antagonist for asthma",
    price: 27.99,
    image: "https://example.com/montelukast.jpg",
    prescriptionRequired: true,
    stock: 95,
    manufacturer: "Respiratory Care",
    activeIngredient: "Montelukast",
    medicineType: "Tablet",
    sideEffects: "May cause headache, stomach pain",
    usageInstruction: "Take one tablet daily in the evening",
    storageCondition: "Store in a cool, dry place",
    barcode: "6789012345679"
  },
  {
    name: "Simvastatin 40mg",
    description: "Cholesterol-lowering medication",
    price: 26.99,
    image: "https://example.com/simvastatin.jpg",
    prescriptionRequired: true,
    stock: 100,
    manufacturer: "Cardio Health",
    activeIngredient: "Simvastatin",
    medicineType: "Tablet",
    sideEffects: "May cause muscle pain",
    usageInstruction: "Take one tablet daily at bedtime",
    storageCondition: "Store in a cool, dry place",
    barcode: "7890123456780"
  },
  {
    name: "Ciprofloxacin 500mg",
    description: "Antibiotic for bacterial infections",
    price: 29.99,
    image: "https://example.com/ciprofloxacin.jpg",
    prescriptionRequired: true,
    stock: 70,
    manufacturer: "ABC Pharma",
    activeIngredient: "Ciprofloxacin",
    medicineType: "Tablet",
    sideEffects: "May cause nausea, diarrhea",
    usageInstruction: "Take as prescribed by your doctor",
    storageCondition: "Store in a cool, dry place",
    barcode: "8901234567891"
  },
  {
    name: "Diclofenac 50mg",
    description: "Non-steroidal anti-inflammatory drug",
    price: 16.99,
    image: "https://example.com/diclofenac.jpg",
    prescriptionRequired: false,
    stock: 180,
    manufacturer: "Pain Relief Inc",
    activeIngredient: "Diclofenac",
    medicineType: "Tablet",
    sideEffects: "May cause stomach upset",
    usageInstruction: "Take 1-2 tablets daily with food",
    storageCondition: "Store in a cool, dry place",
    barcode: "9012345678902"
  },
  {
    name: "Fexofenadine 180mg",
    description: "Antihistamine for allergies",
    price: 13.99,
    image: "https://example.com/fexofenadine.jpg",
    prescriptionRequired: false,
    stock: 220,
    manufacturer: "Allergy Relief Pharma",
    activeIngredient: "Fexofenadine",
    medicineType: "Tablet",
    sideEffects: "Rare side effects include headache",
    usageInstruction: "Take one tablet daily",
    storageCondition: "Store in a cool, dry place",
    barcode: "0123456789013"
  }
];

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123!",
    phone: "1234567890",
    role: "user"
  },
  {
    name: "Ahmed Fares",
    email: "ahmedfares659@gamil.com",
    password: "Test@1234",
    phone: "1234567890",
    role: "user"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123!",
    phone: "9876543210",
    role: "admin"
  },
  {
    name: "Pharmacy Owner",
    email: "pharmacy@example.com",
    password: "Pharmacy123!",
    phone: "5555555555",
    role: "pharmacy_owner"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "Password123!",
    phone: "1112223333",
    role: "user"
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    password: "Password123!",
    phone: "4445556666",
    role: "user"
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "Password123!",
    phone: "7778889999",
    role: "user"
  },
  {
    name: "David Brown",
    email: "david@example.com",
    password: "Password123!",
    phone: "2223334444",
    role: "user"
  },
  {
    name: "Lisa Anderson",
    email: "lisa@example.com",
    password: "Password123!",
    phone: "5556667777",
    role: "user"
  },
  {
    name: "Tom Harris",
    email: "tom@example.com",
    password: "Password123!",
    phone: "8889990000",
    role: "user"
  },
  {
    name: "Emma Davis",
    email: "emma@example.com",
    password: "Password123!",
    phone: "3334445555",
    role: "user"
  },
  {
    name: "James Wilson",
    email: "james@example.com",
    password: "Password123!",
    phone: "6667778888",
    role: "user"
  },
  {
    name: "Mary Taylor",
    email: "mary@example.com",
    password: "Password123!",
    phone: "9990001111",
    role: "user"
  },
  {
    name: "Robert Clark",
    email: "robert@example.com",
    password: "Password123!",
    phone: "2223334444",
    role: "user"
  },
  {
    name: "Patricia White",
    email: "patricia@example.com",
    password: "Password123!",
    phone: "5556667777",
    role: "user"
  },
  {
    name: "Michael Lee",
    email: "michael@example.com",
    password: "Password123!",
    phone: "8889990000",
    role: "user"
  },
  {
    name: "Jennifer Hall",
    email: "jennifer@example.com",
    password: "Password123!",
    phone: "1112223333",
    role: "user"
  },
  {
    name: "William Turner",
    email: "william@example.com",
    password: "Password123!",
    phone: "4445556666",
    role: "user"
  },
  {
    name: "Elizabeth Moore",
    email: "elizabeth@example.com",
    password: "Password123!",
    phone: "7778889999",
    role: "user"
  },
  {
    name: "Richard Martin",
    email: "richard@example.com",
    password: "Password123!",
    phone: "0001112222",
    role: "user"
  },
  {
    name: "Susan Thompson",
    email: "susan@example.com",
    password: "Password123!",
    phone: "3334445555",
    role: "user"
  }
];

const pharmacies = [
  {
    name: "City Pharmacy",
    address: "123 Main St, City",
    phone: "1112223333",
    image: "https://example.com/pharmacy1.jpg",
    rating: 4.5,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2357, 30.0444] // longitude, latitude
    },
  },
  {
    name: "Health Plus Pharmacy",
    address: "456 Health Ave, City",
    phone: "4445556666",
    image: "https://example.com/pharmacy2.jpg",
    rating: 4.8,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2368, 30.0455]
    },
  },
  {
    name: "MediCare Pharmacy",
    address: "789 Care St, City",
    phone: "7778889999",
    image: "https://example.com/pharmacy3.jpg",
    rating: 4.6,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2379, 30.0466]
    },
  },
  {
    name: "Wellness Pharmacy",
    address: "321 Wellness Blvd, City",
    phone: "2223334444",
    image: "https://example.com/pharmacy4.jpg",
    rating: 4.7,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2380, 30.0477]
    },
  },
  {
    name: "Family Pharmacy",
    address: "654 Family Lane, City",
    phone: "5556667777",
    image: "https://example.com/pharmacy5.jpg",
    rating: 4.9,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2391, 30.0488]
    },
  },
  {
    name: "Community Pharmacy",
    address: "987 Community Rd, City",
    phone: "8889990000",
    image: "https://example.com/pharmacy6.jpg",
    rating: 4.4,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2402, 30.0499]
    },
  },
  {
    name: "Express Pharmacy",
    address: "147 Express Way, City",
    phone: "1112223333",
    image: "https://example.com/pharmacy7.jpg",
    rating: 4.3,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2413, 30.0500]
    },
  },
  {
    name: "24/7 Pharmacy",
    address: "258 Night St, City",
    phone: "4445556666",
    image: "https://example.com/pharmacy8.jpg",
    rating: 4.5,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2424, 30.0511]
    },
  },
  {
    name: "Green Pharmacy",
    address: "369 Green Ave, City",
    phone: "7778889999",
    image: "https://example.com/pharmacy9.jpg",
    rating: 4.6,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2435, 30.0522]
    },
  },
  {
    name: "Vitality Pharmacy",
    address: "741 Vitality Rd, City",
    phone: "2223334444",
    image: "https://example.com/pharmacy10.jpg",
    rating: 4.7,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2446, 30.0533]
    },
  },
  {
    name: "Life Pharmacy",
    address: "852 Life Blvd, City",
    phone: "5556667777",
    image: "https://example.com/pharmacy11.jpg",
    rating: 4.8,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2457, 30.0544]
    },
  },
  {
    name: "Care Plus Pharmacy",
    address: "963 Care Plus St, City",
    phone: "8889990000",
    image: "https://example.com/pharmacy12.jpg",
    rating: 4.4,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2468, 30.0555]
    },
  },
  {
    name: "Health First Pharmacy",
    address: "159 Health First Ave, City",
    phone: "1112223333",
    image: "https://example.com/pharmacy13.jpg",
    rating: 4.9,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2479, 30.0566]
    },
  },
  {
    name: "MediPlus Pharmacy",
    address: "357 MediPlus Rd, City",
    phone: "4445556666",
    image: "https://example.com/pharmacy14.jpg",
    rating: 4.6,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2480, 30.0577]
    },
  },
  {
    name: "Wellness Plus Pharmacy",
    address: "753 Wellness Plus Blvd, City",
    phone: "7778889999",
    image: "https://example.com/pharmacy15.jpg",
    rating: 4.7,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2491, 30.0588]
    },
  },
  {
    name: "Family Care Pharmacy",
    address: "951 Family Care St, City",
    phone: "2223334444",
    image: "https://example.com/pharmacy16.jpg",
    rating: 4.8,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2502, 30.0599]
    },
  },
  {
    name: "Community Care Pharmacy",
    address: "357 Community Care Ave, City",
    phone: "5556667777",
    image: "https://example.com/pharmacy17.jpg",
    rating: 4.5,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2513, 30.0600]
    },
  },
  {
    name: "Express Care Pharmacy",
    address: "753 Express Care Rd, City",
    phone: "8889990000",
    image: "https://example.com/pharmacy18.jpg",
    rating: 4.4,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2524, 30.0611]
    },
  },
  {
    name: "24/7 Care Pharmacy",
    address: "159 Care 24/7 Blvd, City",
    phone: "1112223333",
    image: "https://example.com/pharmacy19.jpg",
    rating: 4.6,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2535, 30.0622]
    },
  },
  {
    name: "Green Care Pharmacy",
    address: "357 Green Care St, City",
    phone: "4445556666",
    image: "https://example.com/pharmacy20.jpg",
    rating: 4.7,
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [31.2546, 30.0633]
    },
  }
];


const addresses = [
  {
    title: "Home",
    street: "123 Main St",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "12345",
    isDefault: true,
    address: "123 Main St, City, State, Country, 12345",
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    title: "Work",
    street: "456 Work Ave",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "67890",
    isDefault: false,
    address: "456 Work Ave, City, State, Country, 67890",
    latitude: 40.7589,
    longitude: -73.9851
  },
  {
    title: "Home",
    street: "789 Home Blvd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "23456",
    isDefault: false,
    address: "789 Home Blvd, City, State, Country, 23456",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Office",
    street: "321 Office Rd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "34567",
    isDefault: false,
    address: "321 Office Rd, City, State, Country, 34567",
    latitude: 40.7282,
    longitude: -73.7949
  },
  {
    title: "School",
    street: "654 School St",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "45678",
    isDefault: false,
    address: "654 School St, City, State, Country, 45678",
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    title: "College",
    street: "987 College Ave",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "56789",
    isDefault: false,
    address: "987 College Ave, City, State, Country, 56789",
    latitude: 40.8075,
    longitude: -73.9626
  },
  {
    title: "University",
    street: "147 University Blvd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "67890",
    isDefault: false,
    address: "147 University Blvd, City, State, Country, 67890",
    latitude: 40.8075,
    longitude: -73.9626
  },
  {
    title: "Library",
    street: "258 Library Rd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "78901",
    isDefault: false,
    address: "258 Library Rd, City, State, Country, 78901",
    latitude: 40.7527,
    longitude: -73.9772
  },
  {
    title: "Park",
    street: "369 Park St",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "89012",
    isDefault: false,
    address: "369 Park St, City, State, Country, 89012",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Garden",
    street: "741 Garden Ave",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "90123",
    isDefault: false,
    address: "741 Garden Ave, City, State, Country, 90123",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Beach",
    street: "852 Beach Blvd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "01234",
    isDefault: false,
    address: "852 Beach Blvd, City, State, Country, 01234",
    latitude: 40.5795,
    longitude: -73.8382
  },
  {
    title: "Mountain",
    street: "963 Mountain Rd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "12345",
    isDefault: false,
    address: "963 Mountain Rd, City, State, Country, 12345",
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    title: "Lake",
    street: "159 Lake St",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "23456",
    isDefault: false,
    address: "159 Lake St, City, State, Country, 23456",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "River",
    street: "357 River Ave",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "34567",
    isDefault: false,
    address: "357 River Ave, City, State, Country, 34567",
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    title: "Forest",
    street: "753 Forest Blvd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "45678",
    isDefault: false,
    address: "753 Forest Blvd, City, State, Country, 45678",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Hill",
    street: "951 Hill Rd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "56789",
    isDefault: false,
    address: "951 Hill Rd, City, State, Country, 56789",
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    title: "Valley",
    street: "357 Valley St",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "67890",
    isDefault: false,
    address: "357 Valley St, City, State, Country, 67890",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Canyon",
    street: "753 Canyon Ave",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "78901",
    isDefault: false,
    address: "753 Canyon Ave, City, State, Country, 78901",
    latitude: 40.7580,
    longitude: -73.9855
  },
  {
    title: "Desert",
    street: "159 Desert Blvd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "89012",
    isDefault: false,
    address: "159 Desert Blvd, City, State, Country, 89012",
    latitude: 40.7829,
    longitude: -73.9654
  },
  {
    title: "Oasis",
    street: "357 Oasis Rd",
    city: "City",
    state: "State",
    country: "Country",
    zipCode: "90123",
    isDefault: false,
    address: "357 Oasis Rd, City, State, Country, 90123",
    latitude: 40.7580,
    longitude: -73.9855
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://youssefehab1222:4XXZn0r9gEIZiTfI@sehaty.uffzgjj.mongodb.net/?retryWrites=true&w=majority&appName=sehaty");
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
    console.log('Created categories');

    // Map medicines to their appropriate categories
    const categoryMap = {
      'Pain Relief': createdCategories.find(c => c.name === 'Pain Relief')._id,
      'Antibiotics': createdCategories.find(c => c.name === 'Antibiotics')._id,
      'Vitamins': createdCategories.find(c => c.name === 'Vitamins & Supplements')._id,
      'Digestive Health': createdCategories.find(c => c.name === 'Digestive Health')._id,
      'Allergies': createdCategories.find(c => c.name === 'Allergies & Cold')._id,
      'Cardiovascular': createdCategories.find(c => c.name === 'Heart & Blood Pressure')._id,
      'Respiratory': createdCategories.find(c => c.name === 'Respiratory')._id,
      'Diabetes': createdCategories.find(c => c.name === 'Diabetes')._id,
      'Mental Health': createdCategories.find(c => c.name === 'Mental Health')._id,
      'First Aid': createdCategories.find(c => c.name === 'First Aid')._id
    };

    // Add category IDs to medicines
    const medicinesWithCategories = medicines.map(medicine => {
      // Determine the appropriate category based on medicine properties
      let categoryId;
      if (medicine.name.toLowerCase().includes('paracetamol') || 
          medicine.name.toLowerCase().includes('ibuprofen') ||
          medicine.name.toLowerCase().includes('diclofenac')) {
        categoryId = categoryMap['Pain Relief'];
      } else if (medicine.name.toLowerCase().includes('amoxicillin') || 
                 medicine.name.toLowerCase().includes('azithromycin') ||
                 medicine.name.toLowerCase().includes('ciprofloxacin')) {
        categoryId = categoryMap['Antibiotics'];
      } else if (medicine.name.toLowerCase().includes('vitamin')) {
        categoryId = categoryMap['Vitamins'];
      } else if (medicine.name.toLowerCase().includes('omeprazole')) {
        categoryId = categoryMap['Digestive Health'];
      } else if (medicine.name.toLowerCase().includes('cetirizine') || 
                 medicine.name.toLowerCase().includes('loratadine') ||
                 medicine.name.toLowerCase().includes('fexofenadine')) {
        categoryId = categoryMap['Allergies'];
      } else if (medicine.name.toLowerCase().includes('atorvastatin') || 
                 medicine.name.toLowerCase().includes('simvastatin') ||
                 medicine.name.toLowerCase().includes('metoprolol')) {
        categoryId = categoryMap['Cardiovascular'];
      } else if (medicine.name.toLowerCase().includes('salbutamol') || 
                 medicine.name.toLowerCase().includes('montelukast')) {
        categoryId = categoryMap['Respiratory'];
      } else if (medicine.name.toLowerCase().includes('metformin')) {
        categoryId = categoryMap['Diabetes'];
      } else if (medicine.name.toLowerCase().includes('sertraline') || 
                 medicine.name.toLowerCase().includes('fluoxetine')) {
        categoryId = categoryMap['Mental Health'];
      } else {
        // Default to first aid if no specific category is found
        categoryId = categoryMap['First Aid'];
      }

      return {
        ...medicine,
        categoryId,
        availableStock: 0, // Initialize with 0, will be updated with pharmacy-specific stock
        isAvailable: true
      };
    });

    // Create medicines with alternatives
    const createdMedicines = await Medicine.insertMany(medicinesWithCategories);
    console.log('Medicines seeded successfully');

    // Update alternatives with actual IDs
    for (const medicine of createdMedicines) {
      if (medicine.alternatives && medicine.alternatives.length > 0) {
        const alternativeIds = medicine.alternatives.map(altId => {
          const altMedicine = createdMedicines.find(m => m.barcode === altId);
          return altMedicine?._id;
        }).filter(Boolean);

        await Medicine.findByIdAndUpdate(medicine._id, {
          alternatives: alternativeIds
        });
      }
    }
    console.log('Medicine alternatives updated successfully');

    // Create pharmacies
    const createdPharmacies = await Pharmacy.insertMany(pharmacies);
    console.log('Created pharmacies');

    // Create pharmacy-medicine associations
    const pharmacyMedicines = [];
    for (let i = 0; i < createdPharmacies.length; i++) {
      const pharmacy = createdPharmacies[i];
      const startIndex = (i * 6) % createdMedicines.length;
      const endIndex = Math.min(startIndex + 6 + Math.floor(Math.random() * 3), createdMedicines.length);
      
      // Get medicines for this pharmacy
      const pharmacyMedicinesList = createdMedicines.slice(startIndex, endIndex);
      
      // Create pharmacy-medicine associations
      for (const medicine of pharmacyMedicinesList) {
        const stock = Math.floor(Math.random() * 50) + 10; // Random stock between 10-60
        const price = medicine.price * (1 + (Math.random() * 0.2 - 0.1)); // Random price variation ±10%
        
        pharmacyMedicines.push({
          pharmacyId: pharmacy._id,
          medicineId: medicine._id,
          stock: stock,
          price: price,
          discount: Math.floor(Math.random() * 5), // Random discount 0-5%
          isAvailable: true,
          reorderLevel: Math.floor(stock * 0.2), // 20% of stock
          lastRestocked: new Date()
        });
      }
    }

    // Insert pharmacy-medicine associations
    await PharmacyMedicine.insertMany(pharmacyMedicines);
    console.log('Created pharmacy-medicine associations');

    // Update medicine available stock based on pharmacy stock
    for (const medicine of createdMedicines) {
      const totalStock = pharmacyMedicines
        .filter(pm => pm.medicineId.toString() === medicine._id.toString())
        .reduce((sum, pm) => sum + pm.stock, 0);
      
      await Medicine.findByIdAndUpdate(medicine._id, {
        availableStock: totalStock,
        isAvailable: totalStock > 0
      });
    }
    console.log('Updated medicine stock');

    // Create users with hashed passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Users seeded');

    // Create addresses for users
    const addressesWithUsers = addresses.map((address, index) => {
      const user = createdUsers[index % createdUsers.length];
      return {
        ...address,
        userId: user._id
      };
    });
    const createdAddresses = await Address.insertMany(addressesWithUsers);
    console.log('Created addresses');

    // Create carts for users
    const carts = createdUsers.map(user => ({
      userId: user._id,
      items: []
    }));
    await Cart.insertMany(carts);
    console.log('Created carts');

    // Create wishlists for users with some medicines
    const wishlistItems = [];
    const usedCombinations = new Set(); // Track used user-medicine combinations

    for (const user of createdUsers) {
      // Create 1-3 wishlist items per user
      const numItems = Math.floor(Math.random() * 3) + 1;
      let itemsCreated = 0;
      
      while (itemsCreated < numItems) {
        const medicine = createdMedicines[Math.floor(Math.random() * createdMedicines.length)];
        const combination = `${user._id}-${medicine._id}`;
        
        // Only add if this combination hasn't been used
        if (!usedCombinations.has(combination)) {
          wishlistItems.push({
            userId: user._id,
            medicineId: medicine._id
          });
          usedCombinations.add(combination);
          itemsCreated++;
        }
      }
    }
    await Wishlist.insertMany(wishlistItems);
    console.log('Created wishlists');

    // Create some reviews
    const reviewItems = [];
    for (const user of createdUsers) {
      // Create 1-2 reviews per user
      const numReviews = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numReviews; i++) {
        reviewItems.push({
          userId: user._id,
          targetType: Math.random() > 0.5 ? 'medicine' : 'pharmacy',
          targetId: Math.random() > 0.5 
            ? createdMedicines[Math.floor(Math.random() * createdMedicines.length)]._id
            : createdPharmacies[Math.floor(Math.random() * createdPharmacies.length)]._id,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: 'Great product/service!',
          isVerified: true
        });
      }
    }
    await Review.insertMany(reviewItems);
    console.log('Created reviews');

    // Create some orders
    const orderItems = [];
    for (const user of createdUsers) {
      // Create 1-3 orders per user
      const numOrders = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numOrders; i++) {
        const items = Array(Math.floor(Math.random() * 3) + 1).fill().map(() => ({
          medicine: createdMedicines[Math.floor(Math.random() * createdMedicines.length)]._id,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: Math.floor(Math.random() * 100) + 10
        }));
        
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = Math.floor(Math.random() * (totalPrice * 0.2)); // Up to 20% discount
        
        orderItems.push({
          userId: user._id,
          items,
          status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
          totalPrice,
          discount,
          finalPrice: totalPrice - discount,
          paymentMethod: ['cash', 'card', 'paypal'][Math.floor(Math.random() * 3)],
          deliveryAddress: createdAddresses[Math.floor(Math.random() * createdAddresses.length)]._id,
          isPaid: Math.random() > 0.5
        });
      }
    }
    await Order.insertMany(orderItems);
    console.log('Created orders');

    // Update user references
    for (const user of createdUsers) {
      const userAddresses = createdAddresses.filter(addr => addr.userId.toString() === user._id.toString());
      const userOrders = orderItems.filter(order => order.userId.toString() === user._id.toString());
      const userWishlists = wishlistItems.filter(wish => wish.userId.toString() === user._id.toString());
      const userReviews = reviewItems.filter(review => review.userId.toString() === user._id.toString());

      await User.findByIdAndUpdate(user._id, {
        addresses: userAddresses.map(addr => addr._id),
        orders: userOrders.map(order => order._id),
        wishlists: userWishlists.map(wish => wish._id),
        reviews: userReviews.map(review => review._id)
      });
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 