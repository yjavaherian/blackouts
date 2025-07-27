declare global {
	namespace App {
		interface Locals {
			user: {
				id: number;
				mobile: string;
				createdAt: string;
				lastLogin: string | null;
				lastRefresh: string | null;
			} | null;
			session: {
				id: string;
				userId: number;
				expiresAt: number;
			} | null;
		}
	}
}
export {};
