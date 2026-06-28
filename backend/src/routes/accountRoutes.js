const express = require('express');
const router = express.Router();
const { getAccount, updateAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAccount);
router.put('/', protect, updateAccount);

module.exports = router;
