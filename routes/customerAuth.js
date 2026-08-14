const express = require('express');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const router = express.Router();

// Register customer
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const customer = new Customer({ fullName, email, phone, password });
    await customer.save();

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      token,
      customer: { id: customer._id, fullName: customer.fullName, email: customer.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login customer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      token,
      customer: { id: customer._id, fullName: customer.fullName, email: customer.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
