// core/nostr.js

window.NG_Nostr = {
  parseKind3Events(events) {
    const contacts = [];

    events.forEach(ev => {
      if (ev.kind !== 3) return;
      if (!Array.isArray(ev.tags)) return;

      ev.tags.forEach(tag => {
        if (tag[0] === "p" && tag[1]) {
          contacts.push({
            pubkey: tag[1],
            relay: ev._relay || null
          });
        }
      });
    });

    return contacts;
  }
};
