"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTrackedEmail = sendTrackedEmail;
exports.recordEmailFailure = recordEmailFailure;
const event_store_js_1 = require("./event-store.js");
async function sendTrackedEmail(input) {
    const reserved = await (0, event_store_js_1.reserveEmailEvent)({
        eventKey: input.eventKey,
        type: input.type,
        recipient: input.recipient,
        template: input.template,
        userId: input.userId,
        applicationId: input.applicationId
    });
    if (!reserved)
        return;
    try {
        const sent = await input.provider.sendEmail(input.payload);
        await (0, event_store_js_1.markEmailSent)(input.eventKey, sent.id);
    }
    catch (error) {
        await (0, event_store_js_1.markEmailFailed)(input.eventKey, error, input.secrets);
        throw error;
    }
}
async function recordEmailFailure(input) {
    const reserved = await (0, event_store_js_1.reserveEmailEvent)({
        eventKey: input.eventKey,
        type: input.type,
        recipient: input.recipient || 'unknown',
        template: input.template,
        userId: input.userId,
        applicationId: input.applicationId
    });
    if (reserved)
        await (0, event_store_js_1.markEmailFailed)(input.eventKey, new Error(input.error));
}
//# sourceMappingURL=send.js.map