const express = require('express');
const router = express.Router();
const passport=require('passport');
const usersController = require('../controllers/users_controller');

router.get('/profile/:id',passport.checkAuthentication,usersController.profile);
router.post('/update/:id',passport.checkAuthentication,usersController.update);
router.get('/profile',usersController.profile);
router.get('/employee/:id',usersController.update);
router.post('/edit/:id',usersController.edit);
router.get('/employee/delete/:id',usersController.delete);
router.get('/employee/addfeedback/:id',usersController.addFeedback);
router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.get('/employee/feedbackrequest/:id',usersController.addFeedbackrequest);
router.post('/employee/createFeedback/:id',usersController.createFeedback);
router.get('/newfeedback/:id',usersController.newFeedback);
console.log("routes user")
router.post('/create', usersController.create);
router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'},
), usersController.createSession);
router.get('/sign-out',usersController.destroySession);
module.exports = router;