const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the 'User' model (the donor)
    required: true
  },
  donationType: {
    type: String,
    required: true,
    enum: ['blood', 'organ', 'tissue'] // Limits the donation type to blood, organ, or tissue
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] // Valid blood types, with an empty string allowed
  },
  organType: {
    type: String // This is for organ donation, and will be used only when donationType is 'organ'
  },
  donationDate: {
    type: Date,
    default: Date.now // Automatically sets the date when a donation is created
  },
  hospital: {
    type: String // Can store the name of the hospital where the donation took place
  },
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'cancelled'], // Status of the donation
    default: 'completed' // Default status when the donation is created
  }
});

// Create and export the Donation model
module.exports = mongoose.model('Donation', DonationSchema);
