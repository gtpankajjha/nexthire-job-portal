"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const resend_1 = require("resend");
class ResendProvider {
    apiKey;
    from;
    client;
    constructor(apiKey, from) {
        this.apiKey = apiKey;
        this.from = from;
        this.client = new resend_1.Resend(apiKey);
    }
    async sendEmail(payload) {
        const response = await this.client.emails.send({
            from: this.from,
            to: payload.to,
            subject: payload.subject,
            html: payload.html
        });
        if (response.error) {
            throw new Error(response.error.message || 'Resend rejected the email request.');
        }
        return { id: response.data?.id };
    }
}
exports.ResendProvider = ResendProvider;
//# sourceMappingURL=resend.provider.js.map