import express from 'express'
import { verifyMFA } from '../controllers/mfaController';

const mfaRouter = express.Router()

mfaRouter.post('/verify', verifyMFA);

export default mfaRouter;