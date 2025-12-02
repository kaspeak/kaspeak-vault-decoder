const { Kaspeak, sha256FromString, BaseMessage } = require("kaspeak-sdk");
const fs = require("fs");

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const BASE = 62;

const MAP = (() => {
	const m = new Array(256).fill(-1);
	for (let i = 0; i < ALPHABET.length; i++) m[ALPHABET.charCodeAt(i)] = i;
	return m;
})();

function base62ToBytes(s) {
	const str = s.replace(/\s+/g, "");
	if (str.length === 0) throw new Error("Empty Base62");
	let zeros = 0;
	while (zeros < str.length && str.charCodeAt(zeros) === 48) zeros++;
	const b256 = [];
	for (let i = zeros; i < str.length; i++) {
		const code = str.charCodeAt(i);
		if (code > 255) throw new Error("Invalid Base62");
		const val = MAP[code];
		if (val < 0) throw new Error("Invalid Base62");
		let carry = val;
		for (let j = 0; j < b256.length; j++) {
			const x = b256[j] * BASE + carry;
			b256[j] = x & 0xff;
			carry = x >> 8;
		}
		while (carry > 0) {
			b256.push(carry & 0xff);
			carry >>= 8;
		}
	}
	const out = new Uint8Array(zeros + b256.length);
	for (let i = 0; i < zeros; i++) out[i] = 0;
	for (let i = 0; i < b256.length; i++) out[out.length - 1 - i] = b256[i];
	return out;
}

class VaultMessage extends BaseMessage {
	static messageType = 1;
	static requiresEncryption = true;

	fromPlainObject(o) {
		for (const k of Object.keys(o)) {
			this[k] = o[k];
		}
		return this;
	}
}

async function decryptBackup(base62, pass) {
	const sdk = await Kaspeak.create(1);
	sdk.registerMessage(VaultMessage);
	const blob = base62ToBytes(base62);
	const key = sha256FromString(pass);
	const msg = await sdk.decode({ type: 1 }, blob, key);
	if (!(msg instanceof VaultMessage)) {
		const err = new Error("Invalid password");
		err.code = "INVALID_PASSWORD";
		throw err;
	}
	return msg;
}

async function main() {
	const args = process.argv.slice(2);
	if (args.length < 2) {
		console.error("Usage: node decode-vault.js <backup-or-path> <password>");
		process.exit(1);
	}
	const input = args[0];
	const pass = args[1];

	let base62 = input;
	try {
		if (fs.existsSync(input) && fs.statSync(input).isFile()) {
			base62 = fs.readFileSync(input, "utf8");
		}
	} catch {}

	let vault;
	try {
		vault = await decryptBackup(base62, pass);
	} catch (e) {
		const msg = e && e.message ? e.message : String(e);
		const code = e && e.code ? e.code : "";
		if (code === "INVALID_PASSWORD" || msg === "Invalid password") {
			console.error("Invalid password: unable to decrypt backup with the provided passphrase.");
		} else {
			console.error("Failed to decrypt vault:", msg);
		}
		process.exit(2);
	}

	if (!vault) {
		console.error("Vault decrypted but result is empty");
		process.exit(3);
	}

	const privHex = vault.p.toString();
	const result = {
		privHex: privHex,
		privDec: BigInt("0x" + privHex).toString(10),
		subs: vault.u,
		secrets: vault.s
	};
	console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
	const msg = e && e.message ? e.message : String(e);
	console.error("Unexpected error:", msg);
	process.exit(1);
});
