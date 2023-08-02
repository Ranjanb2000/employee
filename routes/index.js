const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home_controller');

router.get('/', homeController.home);
console.log("routes index");
router.get('/addcompany',homeController.add);
router.post('/createcompany',homeController.create);


router.use('/users', require('./users'));



module.exports = router;