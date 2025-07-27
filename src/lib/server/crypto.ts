import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const ALGORITHM = 'aes-256-gcm';

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
	return (await scryptAsync(password, salt, 32)) as Buffer;
}

export async function encryptToken(token: string): Promise<string> {
	if (!token) return token;

	try {
		const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
		const salt = randomBytes(16);
		const iv = randomBytes(16);
		const key = await deriveKey(encryptionKey, salt);

		const cipher = createCipheriv(ALGORITHM, key, iv);
		let encrypted = cipher.update(token, 'utf8', 'hex');
		encrypted += cipher.final('hex');

		const authTag = cipher.getAuthTag();

		// Combine salt, iv, authTag, and encrypted data
		return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
	} catch (error) {
		console.error('Error encrypting token:', error);
		return token; // Return original token if encryption fails
	}
}

export async function decryptToken(encryptedToken: string): Promise<string> {
	if (!encryptedToken || !encryptedToken.includes(':')) return encryptedToken;

	try {
		const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
		const [saltHex, ivHex, authTagHex, encrypted] = encryptedToken.split(':');
		const salt = Buffer.from(saltHex, 'hex');
		const iv = Buffer.from(ivHex, 'hex');
		const authTag = Buffer.from(authTagHex, 'hex');
		const key = await deriveKey(encryptionKey, salt);

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	} catch (error) {
		console.error('Error decrypting token:', error);
		return encryptedToken; // Return encrypted token if decryption fails
	}
}
