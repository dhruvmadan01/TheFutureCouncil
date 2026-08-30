require('dotenv').config();
const crypto = require('crypto');

module.exports = async (req, res) => {
  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

  // Check for missing payment fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required signature verification fields.' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay secret key not configured on server.' });
  }

  try {
    // Generate signature algorithm matching Razorpay standard web checkout rules
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({ status: 'success', message: 'Payment signature verified successfully.' });
    } else {
      console.warn('Razorpay signature verification mismatch.');
      return res.status(400).json({ error: 'Payment signature verification failed. Mismatch detected.' });
    }
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return res.status(500).json({ error: error.message || 'Signature verification failed.' });
  }
};
