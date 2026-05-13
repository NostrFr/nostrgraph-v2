# nostrgraph-v2
NostrGraph v2 est un analyseur souverain du graphe social Nostr : profondeur 2, détection de communautés, centralité, betweenness, latence par relay, visualisation multidimensionnelle et export JSON complet. 100% client‑side, sans dépendances, architecture brutaliste.

---

## 🟩 Objectif  
Explorer une identité Nostr (npub ou hex) et produire :

- Graphe profondeur 2  
- Détection de communautés (Louvain minimal)  
- Centralité (degree)  
- Betweenness (ponts inter‑communautés)  
- Latence par relay (heatmap)  
- Clusters relay  
- Visualisation multidimensionnelle  
- Export JSON complet

---

## 🟩 Fonctionnement  
Tout est exécuté **localement dans le navigateur** :

- WebSocket → récupération des contacts (kind 3)  
- Analyse → algorithmes maison (Louvain, centralité, betweenness)  
- Rendu → Canvas 2D  
- Export → JSON téléchargeable

Aucune donnée envoyée à un serveur.  
Aucune dépendance externe.  
Aucune librairie.

---

## 🟩 Visualisation  
Chaque nœud encode 5 dimensions :

- **Couleur** → communauté  
- **Bordure** → relay  
- **Taille** → centralité  
- **Halo gris** → latence  
- **Halo rouge** → betweenness (ponts)

---

## 🟩 Export JSON  
Le fichier contient :

```json
{
  "root": "...",
  "nodes": [
    {
      "id": "...",
      "type": "root|depth1|depth2",
      "relay": "wss://...",
      "community": 0,
      "centrality": 0.12,
      "betweenness": 0.03
    }
  ],
  "edges": [
    { "from": "...", "to": "...", "isBridge": true }
  ],
  "relayLatency": {
    "wss://relay.damus.io": 123
  }
}
