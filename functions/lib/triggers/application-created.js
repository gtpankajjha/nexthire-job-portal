"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_js_1 = require("../data/firestore.js");
const config_js_1 = require("../email/config.js");
const send_js_1 = require("../email/send.js");
const resend_provider_js_1 = require("../email/resend.provider.js");
const templates_js_1 = require("../email/templates.js");
exports.applicationCreated = (0, firestore_1.onDocumentCreated)({
    document: 'applications/{applicationId}',
    region: 'asia-south1',
    secrets: [config_js_1.resendApiKey]
}, async (event) => {
    const applicationId = event.params.applicationId;
    const application = readApplication(applicationId, event.data?.data());
    if (!application) {
        console.error('Application notification skipped: required application fields are missing.', { applicationId });
        return;
    }
    const [candidate, employer, job] = await Promise.all([
        (0, firestore_js_1.getUser)(application.seekerId),
        (0, firestore_js_1.getUser)(application.employerId),
        (0, firestore_js_1.getJob)(application.jobId)
    ]);
    const provider = new resend_provider_js_1.ResendProvider(config_js_1.resendApiKey.value(), config_js_1.resendFromEmail.value());
    const candidateEventKey = `application-confirmation:${applicationId}`;
    const employerEventKey = `application-employer-notification:${applicationId}`;
    if (!candidate?.name || !candidate.email || !employer?.name || !employer.email || !job?.title || !job.company) {
        const missing = [
            !candidate?.name || !candidate.email ? 'candidate' : null,
            !employer?.name || !employer.email ? 'employer' : null,
            !job?.title || !job.company ? 'job' : null
        ].filter(Boolean).join(', ');
        console.error('Application notification skipped: required data is missing.', { applicationId, missing });
        await Promise.all([
            (0, send_js_1.recordEmailFailure)({
                eventKey: candidateEventKey,
                type: 'application-confirmation',
                template: 'application-confirmation',
                recipient: candidate?.email,
                applicationId,
                userId: application.seekerId,
                error: `Required ${missing} data is missing.`
            }),
            (0, send_js_1.recordEmailFailure)({
                eventKey: employerEventKey,
                type: 'application-employer-notification',
                template: 'application-employer-notification',
                recipient: employer?.email,
                applicationId,
                userId: application.employerId,
                error: `Required ${missing} data is missing.`
            })
        ]);
        return;
    }
    const templateData = { candidate, employer, job };
    const results = await Promise.allSettled([
        (0, send_js_1.sendTrackedEmail)({
            eventKey: candidateEventKey,
            type: 'application-confirmation',
            template: 'application-confirmation',
            recipient: candidate.email,
            payload: { to: candidate.email, ...(0, templates_js_1.applicationConfirmationEmail)(templateData) },
            provider,
            userId: application.seekerId,
            applicationId,
            secrets: [config_js_1.resendApiKey.value()]
        }),
        (0, send_js_1.sendTrackedEmail)({
            eventKey: employerEventKey,
            type: 'application-employer-notification',
            template: 'application-employer-notification',
            recipient: employer.email,
            payload: { to: employer.email, ...(0, templates_js_1.employerNewApplicationEmail)(templateData) },
            provider,
            userId: application.employerId,
            applicationId,
            secrets: [config_js_1.resendApiKey.value()]
        })
    ]);
    if (results.some(result => result.status === 'rejected')) {
        throw new Error('One or more application notification emails failed.');
    }
});
function readApplication(applicationId, data) {
    if (!data || typeof data.jobId !== 'string' || typeof data.seekerId !== 'string' || typeof data.employerId !== 'string' || typeof data.status !== 'string') {
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
//# sourceMappingURL=application-created.js.map