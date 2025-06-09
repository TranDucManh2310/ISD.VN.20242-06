const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderCode: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
            return `ORD-${timestamp}-${randomStr}`;
        }
    },
    orderItems: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
        }
    }],
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    paymentInfo: {
        id: {
            type: String
        },
        status: {
            type: String
        }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'Processing'
    },
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware để đảm bảo orderCode luôn tồn tại
orderSchema.pre('save', function(next) {
    if (!this.orderCode) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderCode = `ORD-${timestamp}-${randomStr}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);