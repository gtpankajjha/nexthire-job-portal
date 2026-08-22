"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendFromEmail = exports.resendApiKey = void 0;
const params_1 = require("firebase-functions/params");
exports.resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
exports.resendFromEmail = (0, params_1.defineString)('RESEND_FROM_EMAIL');
//# sourceMappingURL=config.js.map