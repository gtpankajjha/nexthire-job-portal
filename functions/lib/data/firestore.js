"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getJob = getJob;
const firebase_js_1 = require("../firebase.js");
async function getUser(userId) {
    const snapshot = await firebase_js_1.db.doc(`users/${userId}`).get();
    if (!snapshot.exists)
        return null;
    const data = snapshot.data();
    if (!data.email || !data.name || !data.role)
        return null;
    return {
        id: snapshot.id,
        email: data.email,
        name: data.name,
        role: data.role
    };
}
async function getJob(jobId) {
    const snapshot = await firebase_js_1.db.doc(`jobs/${jobId}`).get();
    if (!snapshot.exists)
        return null;
    const data = snapshot.data();
    if (!data.title || !data.company)
        return null;
    return {
        id: snapshot.id,
        title: data.title,
        company: data.company
    };
}
//# sourceMappingURL=firestore.js.map