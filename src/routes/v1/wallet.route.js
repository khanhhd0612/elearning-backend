const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const walletValidation = require('../../validations/wallet.validation');
const walletController = require('../../controllers/wallet.controller');

const router = express.Router();

router.get('/', auth(), walletController.getWallet);
router.get('/transactions', auth(), validate(walletValidation.getTransactions), walletController.getTransactions);
router.post('/topup/initiate', auth(), validate(walletValidation.initiateTopup), walletController.initiateTopup);
router.post('/purchase', auth(), validate(walletValidation.purchaseWithWallet), walletController.purchaseWithWallet);

router.get('/topup/vnpay/ipn', walletController.vnpayIPN);
router.get('/topup/vnpay/return', walletController.vnpayReturn);
router.post('/topup/sepay/webhook', walletController.sepayWebhook);

module.exports = router;