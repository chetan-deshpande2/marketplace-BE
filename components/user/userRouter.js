import express from 'express';
import {
  profile,
  updateProfile,
  addCollaborator,
  getUserProfilewithNfts,
  getAddressById,
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

//   router.post(
//     "/allDetails",
//     UserMiddleware.verifyWithoutToken,
//     userController.getAllUserDetails
//   );

export default router;
