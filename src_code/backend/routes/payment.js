const express = require('express')
const router = express.Router();

const {
   receiveHookPayment,createPaymentLink
} = require('../controllers/paymentController')

const { isAuthenticatedUser } = require('../middlewares/auth')

// router.route('/payment/process').post(isAuthenticatedUser, processPayment);
// router.route('/stripeapi').get(isAuthenticatedUser, sendStripApi);
router.route("/payment/create-payment-link").post(createPaymentLink)
router.route("/payment/receive-hook").post(receiveHookPayment)


/*const { generateBankQR, generateMoMoQR } = require('../utils/qrCode');

router.get('/bank', (req, res) => {
  const { bankCode, accountNumber, amount, description } = req.query;
  const qrUrl = generateBankQR(bankCode, accountNumber, amount, description);
  res.json({ qrUrl });
});

router.get('/momo', (req, res) => {
  const { phoneNumber, amount, description } = req.query;
  const qrUrl = generateMoMoQR(phoneNumber, amount, description);
  res.json({ qrUrl });
});*/

module.exports = router;