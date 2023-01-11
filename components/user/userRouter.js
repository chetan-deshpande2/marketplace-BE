import express from 'express';

import {
  profile,
  updateProfile,
  addCollaborator,
  getUserProfilewithNfts,
  getAddressById,
  getAllUserDetails
} from './userController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();

router.get('/profile', verifyToken, profile);
router.post('/updateProfile', verifyToken, updateProfile);

router.post('/addCollaborator', verifyToken, addCollaborator);

router.post('/profileDetail', getUserProfilewithNfts);

router.post('/getAddressById', getAddressById);
router.post('/getAllUserDetails', getAllUserDetails);
//   router.post(
//     "/collaboratorList",
//     UserMiddleware.verifyToken,
//     userController.collaboratorList
//   );
//   router.get(
//     "/getCollaboratorList",
//     UserMiddleware.verifyToken,
//     userController.getCollaboratorList
//   );

//   router.get(
//     "/deleteCollaborator/:collaboratorAddress",
//     UserMiddleware.verifyToken,
//     userController.deleteCollaborator
//   );
//   router.get(
//     "/getCollaboratorName/:collaboratorAddress",
//     UserMiddleware.verifyToken,
//     userController.getCollaboratorName
//   );
//   router.put(
//     "/editCollaborator",
//     UserMiddleware.verifyToken,
//     userController.editCollaborator
//   );
//   router.get("/categories", userController.getCategories);;

//   router.post(
//     "/profileWithNfts",
//     UserMiddleware.verifyWithoutToken,
//     userController.getUserWithNfts
//   );

export default router;
