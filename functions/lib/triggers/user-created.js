"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_js_1 = require("../data/firestore.js");
const event_store_js_1 = require("../email/event-store.js");
const resend_provider_js_1 = require("../email/resend.provider.js");
const templates_js_1 = require("../email/templates.js");
const config_js_1 = require("../email/config.js");
exports.userCreated = (0, firestore_1.onDocumentCreated)({
    document: 'users/{userId}',
    region: 'asia-south1',
    secrets: [config_js_1.resendApiKey]
}, async (event) => {
    const userId = event.params.userId;
    const user = await (0, firestore_js_1.getUser)(userId);
    if (!user?.email)
        return;
    const eventKey = `welcome:${userId}`;
    const reserved = await (0, event_store_js_1.reserveEmailEvent)({
        eventKey,
        type: 'welcome',
        recipient: user.email,
        template: 'welcome',
        userId
    });
    if (!reserved)
        return;
    try {
        const provider = new resend_provider_js_1.ResendProvider(config_js_1.resendApiKey.value(), config_js_1.resendFromEmail.value());
        const template = (0, templates_js_1.welcomeEmail)(user);
        const sent = await provider.sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html
        });
        await (0, event_store_js_1.markEmailSent)(eventKey, sent.id);
    }
    catch (error) {
        await (0, event_store_js_1.markEmailFailed)(eventKey, error, [config_js_1.resendApiKey.value()]);
        throw error;
    }
});
//# sourceMappingURL=user-created.js.map