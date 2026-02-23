import express from 'express';
import { signUpFace, loginFace, login, updateProfile } from '../controllers/authController';

const router = express.Router();

// Existing routes (placeholders if any needed)
// router.post('/register', normalRegister); 
// router.post('/login', normalLogin);

router.post('/signup', signUpFace);
router.post('/login', login);
router.post('/login/face', loginFace); // Explicit path for face login to avoid conflict if any
router.put('/update/:userId', updateProfile);

export default router;
