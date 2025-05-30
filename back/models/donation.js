const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donationType: {
    type: String,
    required: true,
    enum: ['blood', 'organ', 'tissue']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  organType: {
    type: String
  },
  donationDate: {
    type: Date,
    default: Date.now
  },
  hospital: {
    type: String
  },
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'cancelled'],
    default: 'completed'
  }
});

module.exports = mongoose.model('Donation', DonationSchema);