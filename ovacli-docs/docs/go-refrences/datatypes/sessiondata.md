# Session Data

this data used for

---

## Data Structure

```yaml
Session Data:
  - SessionID: string
  - AccouuntID: string
```

## Index Relations

The space data references video IDs, linking to the [Video Data](/docs/datatypes/videodata)

```mermaid
flowchart LR
  SessionData e1@==> AccountID
  e1@{ animate: true }

```
