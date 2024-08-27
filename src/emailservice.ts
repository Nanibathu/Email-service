// Mock Email Providers
class MockEmailProvider {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    sendEmail(email: string): Promise<boolean> {
        // Mock random success/failure
        return new Promise((resolve, reject) => {
            const success = Math.random() > 0.5;
            success ? resolve(true) : reject(new Error(`Failed to send email via ${this.name}`));
        });
    }
}

// Email Service with Retry, Fallback, and Rate Limiting
class EmailService {
    providers: MockEmailProvider[];
    maxRetries: number;
    sentEmails: Set<string>;
    rateLimitWindow: number;
    rateLimitCount: number;

    constructor(providers: MockEmailProvider[], maxRetries: number = 3, rateLimitWindow: number = 60000) {
        this.providers = providers;
        this.maxRetries = maxRetries;
        this.sentEmails = new Set();
        this.rateLimitWindow = rateLimitWindow;
        this.rateLimitCount = 0;
    }

    async sendEmail(email: string): Promise<boolean> {
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
                    const success = await provider.sendEmail(email);
                    if (success) {
                        this.sentEmails.add(email);
                        this.rateLimitCount++;
                        console.log(`Email sent successfully via ${provider.name}`);
                        return true;
                    }
                } catch (error: any) {  // Explicitly typing error as 'any'
                    console.log(error.message);
                    attempt++;
                    const backoffTime = 2 ** attempt * 1000;
                    console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, backoffTime));
                }
            }
        }

        console.log('All providers failed to send email.');
        return false;
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

(async () => {
    await emailService.sendEmail('omkarrsv11@gmail.com');
})();
