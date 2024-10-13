import {isAuthenticated, isContractor} from "../middlewares/auth";
import express from "express";
import {createSupervisors} from "../controllers/supervisor.controller";

const contractorRouter = express.Router();

contractorRouter.post('/create-supervisors', isAuthenticated, isContractor, createSupervisors)

export default contractorRouter
