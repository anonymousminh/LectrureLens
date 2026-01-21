// Helper function to convert Buffer to Hex String
function bufToHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Helper function to convert Hex String to Buffer
function hexToBuf(hex: string): ArrayBuffer {
    return Uint8Array.from(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))).buffer;
}

export async function hashPassword(password: string, saltStr?: string){
    const encoder = new TextEncoder();
    const salt = saltStr ? hexToBuf(saltStr) : crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );

    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256,
    );

    return {
        hash: bufToHex(hash),
        salt: bufToHex(salt instanceof ArrayBuffer ? salt : salt.buffer),
    }
}