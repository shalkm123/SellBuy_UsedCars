const bcrypt = require("bcryptjs");
const db = require("./config/db");

const currentYear = new Date().getFullYear();

async function ensureUser({
  full_name,
  email,
  password_hash,
  phone_number,
  aadhaar_encrypted,
  age,
  city,
  state,
  role,
  is_verified,
}) {
  const [result] = await db.query(
    `INSERT INTO users
      (full_name, email, password_hash, phone_number, aadhaar_encrypted, age, city, state, role, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      id = LAST_INSERT_ID(id),
      full_name = VALUES(full_name),
      password_hash = VALUES(password_hash),
      city = VALUES(city),
      state = VALUES(state),
      role = VALUES(role),
      is_verified = VALUES(is_verified)`,
    [full_name, email, password_hash, phone_number, aadhaar_encrypted, age, city, state, role, is_verified]
  );
  return result.insertId;
}

async function countRows(tableName) {
  const [rows] = await db.query(`SELECT COUNT(*) AS total FROM ${tableName}`);
  return rows[0].total;
}

async function seed() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const beforeUsers = await countRows("users");
  const beforeCars = await countRows("cars");
  const beforeOrders = await countRows("orders");

  const adminId = await ensureUser({
    full_name: "Admin User",
    email: "admin@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000001",
    aadhaar_encrypted: "111122223333",
    age: 30,
    city: "Bengaluru",
    state: "Karnataka",
    role: "ADMIN",
    is_verified: true,
  });

  const sellerOneId = await ensureUser({
    full_name: "Aman Seller",
    email: "seller1@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000002",
    aadhaar_encrypted: "444455556666",
    age: 32,
    city: "Delhi",
    state: "Delhi",
    role: "SELLER",
    is_verified: true,
  });

  const sellerTwoId = await ensureUser({
    full_name: "Neha Seller",
    email: "seller2@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000005",
    aadhaar_encrypted: "888899990000",
    age: 35,
    city: "Mumbai",
    state: "Maharashtra",
    role: "SELLER",
    is_verified: true,
  });

  const sellerThreeId = await ensureUser({
    full_name: "Karan Seller",
    email: "seller3@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000008",
    aadhaar_encrypted: "888811112222",
    age: 31,
    city: "Bengaluru",
    state: "Karnataka",
    role: "SELLER",
    is_verified: true,
  });

  const buyerOneId = await ensureUser({
    full_name: "Priya Buyer",
    email: "buyer1@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000003",
    aadhaar_encrypted: "777788889999",
    age: 27,
    city: "Mumbai",
    state: "Maharashtra",
    role: "BUYER",
    is_verified: true,
  });

  const buyerTwoId = await ensureUser({
    full_name: "Ravi Buyer",
    email: "buyer2@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000004",
    aadhaar_encrypted: "222233334444",
    age: 29,
    city: "Pune",
    state: "Maharashtra",
    role: "BUYER",
    is_verified: false,
  });

  const buyerThreeId = await ensureUser({
    full_name: "Anita Buyer",
    email: "buyer3@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000006",
    aadhaar_encrypted: "555566667777",
    age: 33,
    city: "Chennai",
    state: "Tamil Nadu",
    role: "BUYER",
    is_verified: true,
  });

  const buyerFourId = await ensureUser({
    full_name: "Soham Buyer",
    email: "buyer4@sellbuycars.com",
    password_hash: passwordHash,
    phone_number: "9000000007",
    aadhaar_encrypted: "999900001111",
    age: 26,
    city: "Hyderabad",
    state: "Telangana",
    role: "BUYER",
    is_verified: true,
  });

  await db.query(
    `INSERT INTO seller_profiles (user_id, business_name, bio, rating, total_listings)
     VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      business_name = VALUES(business_name),
      bio = VALUES(bio),
      rating = VALUES(rating),
      total_listings = GREATEST(total_listings, VALUES(total_listings))`,
    [
      sellerOneId, "Aman Motors", "Trusted pre-owned cars with verified history.", 4.6, 6,
      sellerTwoId, "Neha Auto Hub", "City-ready hatchbacks and sedans with clean paperwork.", 4.5, 5,
      sellerThreeId, "Karan Wheels", "SUV specialist with verified pre-inspection reports.", 4.4, 4,
    ]
  );

  await db.query(
    `INSERT INTO buyer_profiles (user_id, preferred_budget_min, preferred_budget_max, preferred_location)
     VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      preferred_budget_min = VALUES(preferred_budget_min),
      preferred_budget_max = VALUES(preferred_budget_max),
      preferred_location = VALUES(preferred_location)
    `,
    [
      buyerOneId, 300000, 900000, "Mumbai",
      buyerTwoId, 700000, 1500000, "Pune",
      buyerThreeId, 450000, 1100000, "Chennai",
      buyerFourId, 600000, 1800000, "Hyderabad",
    ]
  );

  await db.query(
    `INSERT INTO seller_verification
      (user_id, aadhaar_last4, verification_status, verified_at, remarks)
     VALUES
      (?, ?, ?, NOW(), ?),
      (?, ?, ?, NOW(), ?),
      (?, ?, ?, NOW(), ?)
     ON DUPLICATE KEY UPDATE
      aadhaar_last4 = VALUES(aadhaar_last4),
      verification_status = VALUES(verification_status),
      verified_at = VALUES(verified_at),
      remarks = VALUES(remarks)
    `,
    [
      sellerOneId, "6666", "APPROVED", "Verified during seed setup",
      sellerTwoId, "0000", "APPROVED", "Verified during seed setup",
      sellerThreeId, "2222", "APPROVED", "Verified during seed setup",
    ]
  );

  await db.query(
    `INSERT IGNORE INTO wishlists (buyer_id) VALUES (?), (?), (?), (?)`,
    [buyerOneId, buyerTwoId, buyerThreeId, buyerFourId]
  );

  const [wishlistRows] = await db.query("SELECT id, buyer_id FROM wishlists WHERE buyer_id IN (?, ?, ?, ?)", [
    buyerOneId,
    buyerTwoId,
    buyerThreeId,
    buyerFourId,
  ]);
  const wishlistByBuyer = new Map(wishlistRows.map((row) => [row.buyer_id, row.id]));

  const carTemplates = [
    {
      seller_id: sellerOneId,
      title: "Maruti Suzuki Swift VXI",
      brand: "Maruti Suzuki",
      model_name: "Swift",
      variant: "VXI",
      manufacturing_year: 2021,
      price: 620000,
      car_condition: "GOOD",
      kilometers_driven: 36000,
      transmission: "MANUAL",
      fuel_type: "PETROL",
      color: "White",
      location_city: "Delhi",
      location_state: "Delhi",
      ownership: "FIRST",
      seats: 5,
      description: "Single owner car with full service history and insurance.",
      status: "ACTIVE",
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=900&q=80",
    },
    {
      seller_id: sellerOneId,
      title: "Hyundai Creta SX",
      brand: "Hyundai",
      model_name: "Creta",
      variant: "SX",
      manufacturing_year: 2020,
      price: 1150000,
      car_condition: "GOOD",
      kilometers_driven: 48000,
      transmission: "AUTOMATIC",
      fuel_type: "DIESEL",
      color: "Grey",
      location_city: "Delhi",
      location_state: "Delhi",
      ownership: "SECOND",
      seats: 5,
      description: "Well maintained SUV, no accidental history.",
      status: "SOLD",
      is_featured: false,
      image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
    },
    {
      seller_id: sellerTwoId,
      title: "Honda City VX",
      brand: "Honda",
      model_name: "City",
      variant: "VX",
      manufacturing_year: 2019,
      price: 875000,
      car_condition: "GOOD",
      kilometers_driven: 54000,
      transmission: "MANUAL",
      fuel_type: "PETROL",
      color: "Silver",
      location_city: "Mumbai",
      location_state: "Maharashtra",
      ownership: "FIRST",
      seats: 5,
      description: "Sunroof variant, timely service and clean interior.",
      status: "ACTIVE",
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
    },
    {
      seller_id: sellerTwoId,
      title: "Tata Nexon XZ+",
      brand: "Tata",
      model_name: "Nexon",
      variant: "XZ+",
      manufacturing_year: 2022,
      price: 980000,
      car_condition: "NEW",
      kilometers_driven: 18000,
      transmission: "MANUAL",
      fuel_type: "PETROL",
      color: "Blue",
      location_city: "Mumbai",
      location_state: "Maharashtra",
      ownership: "FIRST",
      seats: 5,
      description: "Connected car tech, company warranty still active.",
      status: "ACTIVE",
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=900&q=80",
    },
    {
      seller_id: sellerThreeId,
      title: "Mahindra XUV700 AX7",
      brand: "Mahindra",
      model_name: "XUV700",
      variant: "AX7",
      manufacturing_year: 2023,
      price: 1925000,
      car_condition: "NEW",
      kilometers_driven: 12000,
      transmission: "AUTOMATIC",
      fuel_type: "DIESEL",
      color: "Black",
      location_city: "Bengaluru",
      location_state: "Karnataka",
      ownership: "FIRST",
      seats: 7,
      description: "Top variant with ADAS and panoramic sunroof.",
      status: "ACTIVE",
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80",
    },
    {
      seller_id: sellerThreeId,
      title: "Toyota Innova Crysta GX",
      brand: "Toyota",
      model_name: "Innova Crysta",
      variant: "GX",
      manufacturing_year: 2018,
      price: 1490000,
      car_condition: "MODERATE",
      kilometers_driven: 86000,
      transmission: "MANUAL",
      fuel_type: "DIESEL",
      color: "Maroon",
      location_city: "Bengaluru",
      location_state: "Karnataka",
      ownership: "SECOND",
      seats: 7,
      description: "Family-owned MPV, ideal for long trips.",
      status: "ACTIVE",
      is_featured: false,
      image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&q=80",
    },
    {
      seller_id: sellerTwoId,
      title: "Kia Seltos HTX",
      brand: "Kia",
      model_name: "Seltos",
      variant: "HTX",
      manufacturing_year: 2021,
      price: 1325000,
      car_condition: "GOOD",
      kilometers_driven: 32000,
      transmission: "AUTOMATIC",
      fuel_type: "PETROL",
      color: "Red",
      location_city: "Pune",
      location_state: "Maharashtra",
      ownership: "FIRST",
      seats: 5,
      description: "Feature-rich compact SUV with premium interior.",
      status: "ACTIVE",
      is_featured: true,
      image_url: "https://images.unsplash.com/photo-1549399542-7e8f2e51f5ab?w=900&q=80",
    },
    {
      seller_id: sellerOneId,
      title: "Ford Ecosport Titanium",
      brand: "Ford",
      model_name: "Ecosport",
      variant: "Titanium",
      manufacturing_year: 2017,
      price: 680000,
      car_condition: "MODERATE",
      kilometers_driven: 71000,
      transmission: "MANUAL",
      fuel_type: "DIESEL",
      color: "Orange",
      location_city: "Delhi",
      location_state: "Delhi",
      ownership: "SECOND",
      seats: 5,
      description: "Compact SUV with robust diesel engine.",
      status: "ACTIVE",
      is_featured: false,
      image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80",
    },
  ];

  const batchToken = Date.now();
  const insertedCarIds = [];

  for (const [index, car] of carTemplates.entries()) {
    const carAgeYears = Math.max(currentYear - car.manufacturing_year, 0);
    const [carResult] = await db.query(
      `INSERT INTO cars
        (seller_id, title, brand, model_name, variant, manufacturing_year, car_age_years, price, car_condition,
         kilometers_driven, transmission, fuel_type, color, location_city, location_state, ownership, seats,
         description, status, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car.seller_id,
        car.title,
        car.brand,
        car.model_name,
        car.variant,
        car.manufacturing_year,
        carAgeYears,
        car.price,
        car.car_condition,
        car.kilometers_driven,
        car.transmission,
        car.fuel_type,
        car.color,
        car.location_city,
        car.location_state,
        car.ownership,
        car.seats,
        `${car.description} (Seed batch ${batchToken})`,
        car.status,
        car.is_featured,
      ]
    );

    const carId = carResult.insertId;
    insertedCarIds.push(carId);
    await db.query(
      "INSERT INTO car_images (car_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)",
      [carId, car.image_url, `seed-${batchToken}-${index + 1}`, 1]
    );
  }

  const wishlistInsertRows = [
    [wishlistByBuyer.get(buyerOneId), insertedCarIds[0]],
    [wishlistByBuyer.get(buyerOneId), insertedCarIds[2]],
    [wishlistByBuyer.get(buyerTwoId), insertedCarIds[4]],
    [wishlistByBuyer.get(buyerThreeId), insertedCarIds[3]],
    [wishlistByBuyer.get(buyerFourId), insertedCarIds[6]],
  ].filter((row) => row[0] && row[1]);

  for (const [wishlistId, carId] of wishlistInsertRows) {
    await db.query("INSERT IGNORE INTO wishlist_items (wishlist_id, car_id) VALUES (?, ?)", [wishlistId, carId]);
  }

  if (insertedCarIds.length >= 2) {
    const paidCarId = insertedCarIds[1];
    const orderNumber = `ORD-SEED-${batchToken}`;
    const [orderResult] = await db.query(
      `INSERT INTO orders
        (buyer_id, car_id, seller_id, order_number, amount, currency, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [buyerTwoId, paidCarId, sellerOneId, orderNumber, 1150000, "INR", "PAID", "SUCCESS"]
    );

    await db.query(
      `INSERT INTO payments
        (order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_method, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        orderResult.insertId,
        `razorpay_order_seed_${batchToken}`,
        `razorpay_payment_seed_${batchToken}`,
        `seed_signature_${batchToken}`,
        1150000,
        "INR",
        "VERIFIED",
        "UPI",
      ]
    );
  }

  const inquiryRows = [
    [buyerOneId, insertedCarIds[0], "Is the price negotiable and are service records available?", "open"],
    [buyerTwoId, insertedCarIds[2], "Can we schedule a test drive this weekend?", "replied"],
    [buyerThreeId, insertedCarIds[4], "Any remaining extended warranty?", "open"],
    [buyerFourId, insertedCarIds[6], "Can you share a walkaround video?", "open"],
  ].filter((row) => row[1]);

  for (const inquiry of inquiryRows) {
    await db.query(
      `INSERT INTO inquiries (buyer_id, car_id, message, status)
       VALUES (?, ?, ?, ?)`,
      inquiry
    );
  }

  const afterUsers = await countRows("users");
  const afterCars = await countRows("cars");
  const afterOrders = await countRows("orders");

  console.log("Seed completed successfully in additive mode.");
  console.log(`Users: ${beforeUsers} -> ${afterUsers}`);
  console.log(`Cars: ${beforeCars} -> ${afterCars}`);
  console.log(`Orders: ${beforeOrders} -> ${afterOrders}`);
  console.log("Users:");
  console.log("- admin@sellbuycars.com / Password@123");
  console.log("- seller1@sellbuycars.com / Password@123");
  console.log("- seller2@sellbuycars.com / Password@123");
  console.log("- seller3@sellbuycars.com / Password@123");
  console.log("- buyer1@sellbuycars.com / Password@123");
  console.log("- buyer2@sellbuycars.com / Password@123");
  console.log("- buyer3@sellbuycars.com / Password@123");
  console.log("- buyer4@sellbuycars.com / Password@123");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
 