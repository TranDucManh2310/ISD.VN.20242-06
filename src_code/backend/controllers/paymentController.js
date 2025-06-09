const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const PayOS = require("@payos/node");
const payOS = new PayOS( 
  process.env.REACT_APP_PAYOS_CLIENT_ID,
  process.env.REACT_APP_PAYOS_API_KEY,
  process.env.REACT_APP_PAYOS_CHECKSUM_KEY
);

const Order = require("../models/order");


// Process payments   =>   /api/v1/payment/process
exports.receiveHookPayment = catchAsyncErrors(async (req, res, next) => {
    const {data,success} = req.body;
    const {orderCode,amount}=data
    const donhang=await Order.findOne({orderCode})
    if(donhang){
    if(Number(amount)===donhang.totalPrice && success ){
      await Order.updateOne({orderCode},{paidAt:Date.now()})
    }
      res.status(200).json({success:true}) }
    else res.json({})
})
exports.createPaymentLink = catchAsyncErrors(async (req, res, next) => {
  const { orderCode, totalPrice } = req.body;

  const body = {
    orderCode,
    amount: totalPrice,
    description: "Thanh toan don hang",
    cancelUrl: 'http://localhost:3000/cart',
    returnUrl: 'http://localhost:3000'
  };


  try {
    const { checkoutUrl } = await payOS.createPaymentLink(body);
    await Order.updateOne({ orderCode }, { checkoutUrl });
    return res.json({ checkoutUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Tạo link thanh toán thất bại" });
  }
});
