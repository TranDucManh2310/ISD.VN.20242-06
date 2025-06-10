const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
        type: String,
        // Bỏ select: false để có thể truy cập password
        required: [true, 'Please enter your password']
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// REMOVED: Password hashing middleware
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next()
//     }
//     this.password = await bcrypt.hash(this.password, 10)
// })

// Compare user password - So sánh trực tiếp (plain text)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return enteredPassword === this.password; // So sánh chuỗi trực tiếp
}

// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

// Generate password reset token - Không hash token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Lưu token trực tiếp không hash
    this.resetPasswordToken = resetToken;

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken;
}

module.exports = mongoose.model('User', userSchema);