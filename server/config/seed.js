require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const EmergencyRequest = require('../models/EmergencyRequest');
const Donation = require('../models/Donation');

// Sample data
const users = [
  // Admin
  {
    name: 'System Admin',
    email: 'admin@bloodbank.com',
    password: 'admin123',
    phone: '9876543210',
    role: 'admin',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Blood Bank HQ, Mumbai'
  },
  // Hospitals
  {
    name: 'City General Hospital',
    email: 'hospital1@bloodbank.com',
    password: 'hospital123',
    phone: '9876543211',
    role: 'hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '123 Healthcare Avenue, Mumbai',
    hospitalName: 'City General Hospital',
    registrationNumber: 'HOSP001'
  },
  {
    name: 'Metro Medical Center',
    email: 'hospital2@bloodbank.com',
    password: 'hospital123',
    phone: '9876543212',
    role: 'hospital',
    city: 'Delhi',
    state: 'Delhi',
    address: '456 Medical Complex, Delhi',
    hospitalName: 'Metro Medical Center',
    registrationNumber: 'HOSP002'
  },
  {
    name: 'Sunrise Hospital',
    email: 'hospital3@bloodbank.com',
    password: 'hospital123',
    phone: '9876543213',
    role: 'hospital',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '789 Health Street, Bangalore',
    hospitalName: 'Sunrise Hospital',
    registrationNumber: 'HOSP003'
  },
  // Donors
  {
    name: 'Rahul Sharma',
    email: 'donor1@bloodbank.com',
    password: 'donor123',
    phone: '9876543214',
    role: 'donor',
    bloodGroup: 'A+',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '101 Donor Lane, Mumbai',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
  },
  {
    name: 'Priya Patel',
    email: 'donor2@bloodbank.com',
    password: 'donor123',
    phone: '9876543215',
    role: 'donor',
    bloodGroup: 'B+',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '102 Blood Street, Mumbai',
    isAvailable: true,
    lastDonationDate: null
  },
  {
    name: 'Amit Kumar',
    email: 'donor3@bloodbank.com',
    password: 'donor123',
    phone: '9876543216',
    role: 'donor',
    bloodGroup: 'O+',
    city: 'Delhi',
    state: 'Delhi',
    address: '103 Help Road, Delhi',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000) // 95 days ago
  },
  {
    name: 'Sneha Reddy',
    email: 'donor4@bloodbank.com',
    password: 'donor123',
    phone: '9876543217',
    role: 'donor',
    bloodGroup: 'AB+',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '104 Care Avenue, Bangalore',
    isAvailable: false,
    lastDonationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    name: 'Vikram Singh',
    email: 'donor5@bloodbank.com',
    password: 'donor123',
    phone: '9876543218',
    role: 'donor',
    bloodGroup: 'O-',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '105 Universal Donor Street, Mumbai',
    isAvailable: true,
    lastDonationDate: null
  },
  {
    name: 'Anita Desai',
    email: 'donor6@bloodbank.com',
    password: 'donor123',
    phone: '9876543219',
    role: 'donor',
    bloodGroup: 'A-',
    city: 'Delhi',
    state: 'Delhi',
    address: '106 Rare Blood Lane, Delhi',
    isAvailable: true,
    lastDonationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // 120 days ago
  },
  // Patients
  {
    name: 'Suresh Gupta',
    email: 'patient1@bloodbank.com',
    password: 'patient123',
    phone: '9876543220',
    role: 'patient',
    bloodGroup: 'A+',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '201 Patient Colony, Mumbai'
  },
  {
    name: 'Meera Joshi',
    email: 'patient2@bloodbank.com',
    password: 'patient123',
    phone: '9876543221',
    role: 'patient',
    bloodGroup: 'B+',
    city: 'Delhi',
    state: 'Delhi',
    address: '202 Care Lane, Delhi'
  },
  {
    name: 'Ramesh Iyer',
    email: 'patient3@bloodbank.com',
    password: 'patient123',
    phone: '9876543222',
    role: 'patient',
    bloodGroup: 'O+',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '203 Health Avenue, Bangalore'
  }
];

// Function to generate inventory for a hospital
const generateInventory = (hospitalId) => {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const inventory = [];
  
  bloodGroups.forEach(bloodGroup => {
    const quantity = Math.floor(Math.random() * 15) + 1; // 1-15 units
    const expiryDays = Math.floor(Math.random() * 35) + 7; // 7-42 days
    
    inventory.push({
      hospitalId,
      bloodGroup,
      quantity,
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      collectionDate: new Date(Date.now() - (42 - expiryDays) * 24 * 60 * 60 * 1000),
      source: 'donation',
      isActive: true
    });
  });
  
  return inventory;
};

// Function to generate emergency requests
const generateRequests = (patientIds, hospitalIds) => {
  const requests = [
    {
      patientId: patientIds[0],
      bloodGroup: 'A+',
      quantity: 2,
      urgencyLevel: 'critical',
      location: {
        address: 'City Hospital, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra'
      },
      patientName: 'Suresh Gupta',
      patientPhone: '9876543220',
      hospital: 'City General Hospital',
      doctorName: 'Dr. Sharma',
      reason: 'Emergency surgery scheduled',
      requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      status: 'pending'
    },
    {
      patientId: patientIds[1],
      bloodGroup: 'B+',
      quantity: 3,
      urgencyLevel: 'urgent',
      location: {
        address: 'Metro Medical, Delhi',
        city: 'Delhi',
        state: 'Delhi'
      },
      patientName: 'Meera Joshi',
      patientPhone: '9876543221',
      hospital: 'Metro Medical Center',
      doctorName: 'Dr. Kumar',
      reason: 'Anemia treatment',
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: 'pending'
    },
    {
      patientId: patientIds[2],
      bloodGroup: 'O+',
      quantity: 1,
      urgencyLevel: 'normal',
      location: {
        address: 'Sunrise Hospital, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka'
      },
      patientName: 'Ramesh Iyer',
      patientPhone: '9876543222',
      hospital: 'Sunrise Hospital',
      doctorName: 'Dr. Reddy',
      reason: 'Scheduled transfusion',
      requiredBy: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      status: 'approved',
      assignedHospital: hospitalIds[0]
    }
  ];
  
  return requests;
};

// Seed database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      BloodInventory.deleteMany({}),
      EmergencyRequest.deleteMany({}),
      Donation.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Get hospital and patient IDs
    const hospitalIds = createdUsers
      .filter(u => u.role === 'hospital')
      .map(u => u._id);
    const patientIds = createdUsers
      .filter(u => u.role === 'patient')
      .map(u => u._id);
    const donorIds = createdUsers
      .filter(u => u.role === 'donor')
      .map(u => u._id);

    // Create inventory for each hospital
    const inventoryData = [];
    hospitalIds.forEach(hospitalId => {
      inventoryData.push(...generateInventory(hospitalId));
    });
    await BloodInventory.insertMany(inventoryData);
    console.log(`Created ${inventoryData.length} inventory items`);

    // Create emergency requests
    const requestData = generateRequests(patientIds, hospitalIds);
    await EmergencyRequest.insertMany(requestData);
    console.log(`Created ${requestData.length} emergency requests`);

    // Create some donations
    const donations = [
      {
        donorId: donorIds[0],
        hospitalId: hospitalIds[0],
        bloodGroup: 'A+',
        quantity: 1,
        donationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        donationType: 'whole_blood',
        status: 'completed'
      },
      {
        donorId: donorIds[2],
        hospitalId: hospitalIds[1],
        bloodGroup: 'O+',
        quantity: 1,
        donationDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
        donationType: 'whole_blood',
        status: 'completed'
      },
      {
        donorId: donorIds[3],
        hospitalId: hospitalIds[2],
        bloodGroup: 'AB+',
        quantity: 1,
        donationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        donationType: 'whole_blood',
        status: 'completed'
      }
    ];
    await Donation.insertMany(donations);
    console.log(`Created ${donations.length} donations`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:     admin@bloodbank.com / admin123');
    console.log('Hospital:  hospital1@bloodbank.com / hospital123');
    console.log('Donor:     donor1@bloodbank.com / donor123');
    console.log('Patient:   patient1@bloodbank.com / patient123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();