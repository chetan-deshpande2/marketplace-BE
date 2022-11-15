import express from "express";
import { profile, updateProfile, addCollaborator } from "./userController";
import UserMiddleware from "../../middleware/middleware";

const router = express.Router();

router.get("/profile", UserMiddleware.verifyToken, profile);
router.post("/updateProfile", updateProfile);

router.post("/addCollaborator", UserMiddleware.verifyToken, addCollaborator);
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
//   router.post("/profileDetail", userController.getUserProfilewithNfts);
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
module.exports = router;
