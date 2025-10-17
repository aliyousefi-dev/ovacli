# Authentication

for authentication and authorization, OVA uses session-based authentication.

---

## Session IDs

the hole idea of session is because it saves on memory. it can fastly recognize for the auth checkgin. the user ids can be cheat and also the password is not very good for this because of that we use the session. when a user perform login. it generate a new session id and save that on the Session.json this file contain all the nessary thing here you can see a simple example of hte session:

```
"59ef43f5-e0b6-44dc-bfee-3922b3f610fc": "user"
```

by default it generated with the UUIDs

## In Memory DB

ova uses an in-memory database to store session information temporarily. it load them at runtime and keeps them in memory for quick access. also it save them again when stopped.

This approach allows for fast access to session data, making it ideal for applications with high performance requirements.
