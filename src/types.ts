export interface Flow {}

export interface TokenManager {
    static startTokenLifecycle: () => Promise<void>;
    static getToken: () => string;
}