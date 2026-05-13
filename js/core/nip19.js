// core/nip19.js
// Décodeur NIP-19 minimal (npub → hex)

window.NG_NIP19 = {
  decodeIdentity(input) {
    const v = input.trim();

    if (/^[0-9a-fA-F]{64}$/.test(v)) {
      return v.toLowerCase();
    }

    if (v.startsWith("npub")) {
      return this.decodeNpub(v);
    }

    throw new Error("Format d'identité non reconnu (npub ou hex attendu).");
  },

  decodeNpub(npub) {
    const { words } = bech32.decode(npub);
    const data = bech32.fromWords(words);
    return this.bytesToHex(data);
  },

  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
};

const bech32 = {
  CHARSET: "qpzry9x8gf2tvdw0s3jn54khce6mua7l",

  decode(str) {
    const pos = str.lastIndexOf("1");
    const data = str.slice(pos + 1);
    const words = [];
    for (let c of data) {
      const idx = this.CHARSET.indexOf(c);
      if (idx === -1) throw new Error("Caractère bech32 invalide");
      words.push(idx);
    }
    return { words };
  },

  fromWords(words) {
    let bits = 0;
    let value = 0;
    const out = [];

    for (let w of words) {
      value = (value << 5) | w;
      bits += 5;
      if (bits >= 8) {
        bits -= 8;
        out.push((value >> bits) & 0xff);
      }
    }
    return out;
  }
};
