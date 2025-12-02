# Kaspeak.net Backup Decryption

A simple CLI script for decrypting an exported Kaspeak.net backup.

## What the script does

* Accepts:

  * an encrypted backup
  * the profile password
* Decrypts the data using the Kaspeak SDK.
* Shows formatted JSON that contains:

  * `privHex` — private key in hex
  * `privDec` — the same key in decimal form
  * `subs` — list of subscriptions
  * `secrets` — group and channel secrets

## Requirements

* [Node.js](https://nodejs.org/en/download)
* Installed [`kaspeak-sdk`](https://www.npmjs.com/package/kaspeak-sdk).
* Exported backup from Kaspeak.
* The password you used to protect your profile.

## Getting a backup in Kaspeak.net

In the Kaspeak.net app:

1. Open the profile menu (avatar icon in the top right corner).
2. Select `Export backup`.
3. Enter your password.
4. The app will copy the backup to the clipboard.
5. Paste it into a text file, for example `backup.txt`, and save it.

## Installing the script

It is assumed that Node.js is already installed (see the "Requirements" section).

### Option 1: via git

```bash
git clone https://github.com/kaspeak/kaspeak-vault-decoder.git
cd kaspeak-vault-decoder
npm i
```

### Option 2: via ZIP archive

1. Download the repository as a ZIP (button **Code → Download ZIP**).
2. Extract the archive to any folder.
3. Open this folder in a terminal/command prompt.
4. Run the command:

```bash
npm i
```

## Running

### Option 1: backup in a file

If you saved the backup in a file called `backup.txt`:

```bash
node decode-vault.js backup.txt your_password
```

### Option 2: pass the string directly

Not very convenient, but possible:

```bash
node decode-vault.js "YOUR_BACKUP_STRING" your_password
```

---

## Common errors

* `Invalid password`: incorrect password.

* `Invalid Base62` or `Empty Base62`: corrupted or empty backup. Make sure you copied the entire string.

---

## Important

* Never show the `privHex` and `privDec` output to anyone.
* Do not store decrypted data in publicly accessible locations.
* Everything the script outputs gives full access to your wallet and profile.
