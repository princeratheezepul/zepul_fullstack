import {createCompany,getAllCompanies,updateCompany,deleteCompany,getCompanyById} from '../controllers/company.controller.js';

import Router from 'express';
import { verifyMultiJWT } from '../middleware/multi.auth.middleware.js';
import { verifyJWT } from '../middleware/manager.auth.middleware.js';
const router=Router();


router.route("/addcompany").post(
    verifyMultiJWT,
    createCompany
);

router.route("/getcompany").get(getAllCompanies);
router.route("/updatecompany/:id").put(verifyJWT,updateCompany);    
router.route("/deletecompany/:id").delete(verifyJWT,deleteCompany);
router.get("/getcompany/:id", getCompanyById);

export default router;