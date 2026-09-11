"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = void 0;
const getMe = async (req, res) => {
    res.json(req.user);
};
exports.getMe = getMe;
