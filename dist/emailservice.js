"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Mock Email Providers
class MockEmailProvider {
    constructor(name) {
        this.name = name;
    }
    sendEmail(email) {
        // Mock random success/failure
        return new Promise((resolve, reject) => {
            const success = Math.random() > 0.5;
            success ? resolve(true) : reject(new Error(`Failed to send email via ${this.name}`));
        });
    }
}
// Email Service with Retry, Fallback, and Rate Limiting
class EmailService {
    constructor(providers, maxRetries = 3, rateLimitWindow = 60000) {
        this.providers = providers;
        this.maxRetries = maxRetries;
        this.sentEmails = new Set();
        this.rateLimitWindow = rateLimitWindow;
        this.rateLimitCount = 0;
    }
    sendEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sentEmails.has(email)) {
                console.log('Duplicate email detected. Skipping.');
                return false;
            }
            if (this.rateLimitCount >= 5) {
                console.log('Rate limit exceeded. Please try later.');
                return false;
            }
            for (let i = 0; i < this.providers.length; i++) {
                const provider = this.providers[i];
                let attempt = 0;
                while (attempt < this.maxRetries) {
                    try {
                        const success = yield provider.sendEmail(email);
                        if (success) {
                            this.sentEmails.add(email);
                            this.rateLimitCount++;
                            console.log(`Email sent successfully via ${provider.name}`);
                            return true;
                        }
                    }
                    catch (error) { // Explicitly typing error as 'any'
                        console.log(error.message);
                        attempt++;
                        const backoffTime = Math.pow(2, attempt) * 1000;
                        console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                        yield new Promise((resolve) => setTimeout(resolve, backoffTime));
                    }
                }
            }
            console.log('All providers failed to send email.');
            return false;
        });
    }
    resetRateLimit() {
        setInterval(() => {
            this.rateLimitCount = 0;
        }, this.rateLimitWindow);
    }
}
// Usage Example
const provider1 = new MockEmailProvider('Provider1');
const provider2 = new MockEmailProvider('Provider2');
const emailService = new EmailService([provider1, provider2]);
emailService.resetRateLimit();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield emailService.sendEmail('omkarrsv11@gmail.com');
}))();
