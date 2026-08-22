"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveEmailEvent = reserveEmailEvent;
exports.markEmailSent = markEmailSent;
exports.markEmailFailed = markEmailFailed;
const firestore_1 = require("firebase-admin/firestore");
const firebase_js_1 = require("../firebase.js");
async function reserveEmailEvent(input) {
    const eventRef = firebase_js_1.db.doc(`emailEvents/${input.eventKey}`);
    return firebase_js_1.db.runTransaction(async (transaction) => {
        const existing = (await transaction.get(eventRef)).data();
        if (existing?.status === 'sent' || existing?.status === 'pending')
            return false;
        transaction.set(eventRef, {
            ...input,
            status: 'pending',
            attempts: (existing?.attempts || 0) + 1,
            createdAt: existing?.createdAt || firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    });
}
async function markEmailSent(eventKey, providerMessageId) {
    await firebase_js_1.db.doc(`emailEvents/${eventKey}`).set({
        status: 'sent',
        ...(providerMessageId ? { providerMessageId } : {}),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        sentAt: firestore_1.FieldValue.serverTimestamp()
    }, { merge: true });
}
async function markEmailFailed(eventKey, error, secrets = []) {
    await firebase_js_1.db.doc(`emailEvents/${eventKey}`).set({
        status: 'failed',
        lastError: safeErrorMessage(error, secrets),
        updatedAt: firestore_1.FieldValue.serverTimestamp()
    }, { merge: true });
}
function safeErrorMessage(error, secrets) {
    const message = error instanceof Error ? error.message : 'Email delivery failed.';
    return secrets.reduce((safeMessage, secret) => {
        return secret ? safeMessage.split(secret).join('[redacted]') : safeMessage;
    }, message).replace(/(re|api[_-]?key|authorization|bearer)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]').slice(0, 500);
}
//# sourceMappingURL=event-store.js.map