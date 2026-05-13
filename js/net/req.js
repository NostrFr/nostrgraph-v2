// net/req.js

window.NG_Req = {
  async fetchContacts(pubkeyHex) {
    const relays = window.NG_Relays.DEFAULT_RELAYS;
    const events = [];
    const subid = "ng-" + Math.random().toString(36).slice(2);

    const sockets = relays.map(url => {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        ws.send(JSON.stringify([
          "REQ",
          subid,
          { kinds: [3], authors: [pubkeyHex] }
        ]));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        if (data[0] === "EVENT" && data[1] === subid) {
          const ev = data[2];
          ev._relay = url;
          events.push(ev);
        }

        if (data[0] === "EOSE") {
          ws.close();
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      return ws;
    });

    await Promise.all(
      sockets.map(ws => new Promise(resolve => {
        ws.onclose = resolve;
      }))
    );

    return window.NG_Nostr.parseKind3Events(events);
  },

  async fetchContactsDepth2(rootPubkey) {
    const depth1 = await this.fetchContacts(rootPubkey);
    const depth2Set = new Set();

    for (let c of depth1) {
      try {
        const cContacts = await this.fetchContacts(c.pubkey);
        cContacts.forEach(x => depth2Set.add(JSON.stringify(x)));
      } catch (e) {
        console.warn("Erreur depth2 pour", c.pubkey, e);
      }
    }

    const depth2 = Array.from(depth2Set).map(s => JSON.parse(s));
    return { depth1, depth2 };
  },

  async measureLatency() {
    const relays = window.NG_Relays.DEFAULT_RELAYS;
    const results = [];

    const event = [
      "EVENT",
      "latency-test",
      {
        kind: 1,
        content: "latency-test",
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: "0".repeat(64),
        id: "0".repeat(64),
        sig: "0".repeat(128)
      }
    ];

    await Promise.all(
      relays.map(url => new Promise(resolve => {
        const ws = new WebSocket(url);
        const t0 = performance.now();
        let done = false;

        ws.onopen = () => {
          ws.send(JSON.stringify(event));
        };

        ws.onmessage = () => {
          if (!done) {
            const latency = performance.now() - t0;
            results.push({ relay: url, latency });
            done = true;
            ws.close();
          }
        };

        ws.onerror = () => {
          if (!done) {
            results.push({ relay: url, latency: null });
            done = true;
          }
          ws.close();
        };

        ws.onclose = () => resolve();
      }))
    );

    return results;
  }
};
