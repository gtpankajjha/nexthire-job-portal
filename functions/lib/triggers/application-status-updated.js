"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationStatusUpdated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_js_1 = require("../data/firestore.js");
const config_js_1 = require("../email/config.js");
const send_js_1 = require("../email/send.js");
const resend_provider_js_1 = require("../email/resend.provider.js");
const templates_js_1 = require("../email/templates.js");
const statuses = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
exports.applicationStatusUpdated = (0, firestore_1.onDocumentUpdated)({
    document: 'applications/{applicationId}',
    region: 'asia-south1',
    secrets: [config_js_1.resendApiKey]
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.status === after.status)
        return;
    const applicationId = event.params.applicationId;
    const application = readApplication(applicationId, after);
    const status = after.status;
    const eventKey = `application-status:${applicationId}:${String(after.status)}`;
    if (!application || !statuses.includes(status)) {
        console.error('Application status notification skipped: invalid application or status.', { applicationId, status: after.status });
        await (0, send_js_1.recordEmailFailure)({
            eventKey,
            type: 'application-status',
            template: 'application-status',
            applicationId,
            error: 'Required application data or status is invalid.'
        });
        return;
    }
    const [candidate, job] = await Promise.all([
        (0, firestore_js_1.getUser)(application.seekerId),
        (0, firestore_js_1.getJob)(application.jobId)
    ]);
    if (!candidate?.name || !candidate.email || !job?.title || !job.company) {
        console.error('Application status notification skipped: required data is missing.', { applicationId });
        await (0, send_js_1.recordEmailFailure)({
            eventKey,
            type: 'application-status',
            template: `application-status-${status.toLowerCase()}`,
            recipient: candidate?.email,
            applicationId,
            userId: application.seekerId,
            error: 'Required candidate or job data is missing.'
        });
        return;
    }
    const provider = new resend_provider_js_1.ResendProvider(config_js_1.resendApiKey.value(), config_js_1.resendFromEmail.value());
    await (0, send_js_1.sendTrackedEmail)({
        eventKey,
        type: 'application-status',
        template: `application-status-${status.toLowerCase()}`,
        recipient: candidate.email,
        payload: { to: candidate.email, ...(0, templates_js_1.applicationStatusEmail)({ candidate, job }, status) },
        provider,
        userId: application.seekerId,
        applicationId,
        secrets: [config_js_1.resendApiKey.value()]
    });
});
function readApplication(applicationId, data) {
    if (typeof data.jobId !== 'string' || typeof data.seekerId !== 'string' || typeof data.employerId !== 'string' || typeof data.status !== 'string') {
        return null;
    }
    return {
        id: applicationId,
        jobId: data.jobId,
        seekerId: data.seekerId,
        employerId: data.employerId,
        status: data.status
    };
}
//# sourceMappingURL=application-status-updated.js.map