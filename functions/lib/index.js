"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCreated = exports.applicationStatusUpdated = exports.applicationCreated = void 0;
require("./firebase.js");
const application_created_js_1 = require("./triggers/application-created.js");
Object.defineProperty(exports, "applicationCreated", { enumerable: true, get: function () { return application_created_js_1.applicationCreated; } });
const application_status_updated_js_1 = require("./triggers/application-status-updated.js");
Object.defineProperty(exports, "applicationStatusUpdated", { enumerable: true, get: function () { return application_status_updated_js_1.applicationStatusUpdated; } });
const user_created_js_1 = require("./triggers/user-created.js");
Object.defineProperty(exports, "userCreated", { enumerable: true, get: function () { return user_created_js_1.userCreated; } });
//# sourceMappingURL=index.js.map