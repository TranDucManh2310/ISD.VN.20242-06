// models/payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // Bank, MoMo, PayOS,...
  transactionId: { type: String },           // Mã giao dịch từ cổng thanh toán
  status: { type: String, default: 'PENDING' }, // 'PENDING', 'SUCCESS', 'FAILED'
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);