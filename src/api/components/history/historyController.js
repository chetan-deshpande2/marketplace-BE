import mongoose from "mongoose";

import History from "./historyModel";

module.exports = {
  insertHistory: async (req, res) => {
    try {
      const insertData = new History({
        nftId: req.body.nftId,
        userId: req.body.userId,
        action: req.body.action,
        actionMeta: req.body.actionMeta,
        message: req.body.message,
        sCreated: req.body.created_ts,
      });
      insertData.save().then((results) => {
        return res.send({ message: "Inserted History ", results });
      });
    } catch (error) {
      res.send(error);
    }
  },
  fetchHistory: async (req, res) => {
    try {
      let data = [];
      let nftId = req.body.nftId;
      let userId = req.body.userId;
      let action = req.body.action;
      let actionMeta = req.body.actionMeta;

      const page = parseInt(req.body.page);
      const limit = parseInt(req.body.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      let onftIDQuery = {};
      let ouserIDQuery = {};
      let oactionQuery = {};
      let oactionMetaQuery = {};
      let SearchArray = [];
      let filters = [];
      if (nftId != "All") {
        onftIDQuery = { nftId: mongoose.Types.ObjectId(nftId) };
        SearchArray["nftId"] = mongoose.Types.ObjectId(nftId);
        if (userId != "All") {
          ouserIDQuery = { userId: mongoose.Types.ObjectId(userId) };
          SearchArray["userId"] = mongoose.Types.ObjectId(userId);
        }
        if (action != "All") {
          oactionQuery = { action: action };
          SearchArray["action"] = action;
        }
        if (actionMeta != "All") {
          oactionMetaQuery = { actionMeta: actionMeta };
          SearchArray["actionMeta"] = actionMeta;
        }
        let SearchObj = Object.assign({}, SearchArray);
        console.log(SearchObj);
        console.log(filters);
        const results = {};

        if (endIndex < (await History.countDocuments(SearchObj).exec())) {
          results.next = {
            page: page + 1,
            limit: limit,
          };
        }

        if (startIndex > 0) {
          results.previous = {
            page: page - 1,
            limit: limit,
          };
        }
        await History.find(SearchObj)
          .sort({ sCreated: -1 })
          .select({
            _id: 1,
            nftId: 1,
            userId: 1,
            action: 1,
            actionMeta: 1,
            message: 1,
            sCreated: 1,
          })
          .limit(limit)
          .skip(startIndex)
          .lean()
          .exec()
          .then((res) => {
            data.push(res);
          })
          .catch((e) => {
            console.log("Error", e);
          });
        results.count = await History.countDocuments(SearchObj).exec();
        results.results = data;
        res.header("Access-Control-Max-Age", 600);
        return res.send({ message: "History Details", results });
      }
    } catch (error) {
      res.send(error);
    }
  },
};
