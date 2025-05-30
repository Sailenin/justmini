require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// ✅ Database connection (corrected)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/organDonationDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Schemas
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['donor', 'recipient'], required: true },
    phoneNumber: { type: String },
    bloodType: { type: String },
    organs: { type: String },
    neededBloodType: { type: String },
    neededOrgan: { type: String },
    donations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }],
    address: { type: String },
    medicalHistory: { type: String }
}, { timestamps: true });

const DonationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    donationType: {
        type: String,
        enum: ['blood', 'organ'],
        required: true
    },
    details: { type: String },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'scheduled', 'rejected'],
        default: 'pending'
    },
    hospital: { type: String },
    doctor: { type: String },
    urgency: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' }
});

const User = mongoose.model('User', UserSchema);
const Donation = mongoose.model('Donation', DonationSchema);

// Auth Middleware
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token required'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({
            success: false,
            error: 'Please authenticate'
        });
    }
};

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, userType, phoneNumber, bloodType, organs, neededBloodType, neededOrgan } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            userType,
            phoneNumber,
            bloodType: userType === 'donor' ? bloodType : undefined,
            organs: userType === 'donor' ? organs : undefined,
            neededBloodType: userType === 'recipient' ? neededBloodType : undefined,
            neededOrgan: userType === 'recipient' ? neededOrgan : undefined
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            userType: user.userType,
            userId: user._id,
            userName: user.fullName
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            userType: user.userType,
            userId: user._id,
            userName: user.fullName
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
});

// Donor Info
app.get('/api/donor/info', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'donor') {
            return res.status(403).json({ success: false, error: 'Access restricted to donors only' });
        }

        const donor = await User.findById(req.user._id)
            .select('-password')
            .populate({
                path: 'donations',
                match: { donor: req.user._id },
                select: 'donationType details date status hospital doctor urgency -_id' //Include hospital doctor and urgency
            });

        if (!donor) {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        res.json({ success: true, data: donor });
    } catch (err) {
        console.error('Donor info error:', err);
        res.status(500).json({ success: false, error: 'Server error while fetching donor data' });
    }
});

// Recipient Info
app.get('/api/recipient/info', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'recipient') {
            return res.status(403).json({ success: false, error: 'Access restricted to recipients only' });
        }

        const recipient = await User.findById(req.user._id)
            .select('-password')
            .populate({
                path: 'donations',
                match: { recipient: req.user._id },  // changed to recipient
                select: 'donationType details date status hospital doctor urgency -_id' // Include hospital, doctor, urgency
            });

        if (!recipient) {
            return res.status(404).json({ success: false, error: 'Recipient not found' });
        }

        res.json({ success: true, data: recipient });
    } catch (err) {
        console.error('Recipient info error:', err);
        res.status(500).json({ success: false, error: 'Server error while fetching recipient data' });
    }
});

// Get Donors (Blood & Organ)
app.get('/api/recipient/donors', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'recipient') {
            return res.status(403).json({ success: false, error: 'Access restricted to recipients only' });
        }

        const bloodDonors = await User.find({
            userType: 'donor',
            bloodType: { $exists: true, $ne: '' }
        }).select('fullName email phoneNumber bloodType _id').lean(); // Include _id

        const organDonors = await User.find({
            userType: 'donor',
            organs: { $exists: true, $ne: '' }
        }).select('fullName email organs _id').lean();  // Include _id

        res.json({
            success: true,
            data: { bloodDonors, organDonors }
        });
    } catch (err) {
        console.error('Donor list error:', err);
        res.status(500).json({ success: false, error: 'Server error while fetching donor list' });
    }
});

// Request Donation
app.post('/api/recipient/request', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'recipient') {
            return res.status(403).json({ success: false, error: 'Access restricted to recipients only' });
        }

        const { donorId, donationType, details, hospital, doctor, urgency } = req.body;

        if (!donorId || !donationType) {
            return res.status(400).json({ success: false, error: 'Donor ID and donation type are required' });
        }

        const donor = await User.findById(donorId);
        if (!donor || donor.userType !== 'donor') {
            return res.status(404).json({ success: false, error: 'Donor not found' });
        }

        const donation = new Donation({
            donor: donorId,
            recipient: req.user._id,
            donationType,
            details,
            hospital,
            doctor,
            urgency: urgency || 'normal',
            status: 'pending'
        });

        await donation.save();

        await User.findByIdAndUpdate(donorId, { $push: { donations: donation._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { donations: donation._id } });

        res.status(201).json({ success: true, data: donation });
    } catch (err) {
        console.error('Donation request error:', err);
        res.status(500).json({ success: false, error: 'Server error while creating donation request' });
    }
});

// Recipient Profile Update
app.put('/api/recipient/profile', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'recipient') {
            return res.status(403).json({ success: false, error: 'Access restricted to recipients only' });
        }

        const { phoneNumber, address, medicalHistory, neededBloodType, neededOrgan } = req.body;

        const updatedRecipient = await User.findByIdAndUpdate(
            req.user._id,
            {
                phoneNumber,
                address,
                medicalHistory,
                neededBloodType,
                neededOrgan
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedRecipient) {
            return res.status(404).json({ success: false, error: 'Recipient not found' });
        }

        res.json({ success: true, data: updatedRecipient });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, error: 'Server error while updating profile' });
    }
});
// Recipient Dashboard Info and Available Donors
app.get('/api/recipient/dashboard', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'recipient') {
            return res.status(403).json({ success: false, error: 'Access restricted to recipients only' });
        }

        const recipient = await User.findById(req.user._id).select('-password');

        if (!recipient) {
            return res.status(404).json({ success: false, error: 'Recipient not found' });
        }

        const bloodDonors = await User.find({
            userType: 'donor',
            bloodType: { $exists: true, $ne: '' }
        }).select('fullName email phoneNumber bloodType _id').lean();

        const organDonors = await User.find({
            userType: 'donor',
            organs: { $exists: true, $ne: '' }
        }).select('fullName email organs _id').lean();

        res.json({
            success: true,
            recipientInfo: recipient,
            donors: { bloodDonors, organDonors }
        });
    } catch (err) {
        console.error('Recipient dashboard data error:', err);
        res.status(500).json({ success: false, error: 'Server error while fetching recipient dashboard data' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});     