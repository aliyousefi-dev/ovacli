# Configs

When you create a ova repository it create an `.ova-repo` folder inside that folder. you can find the `configs.json` and change that.

---

## Default Config

you can see the default port and ip and configs that ova create automatically them.

```json
{
	"version": "1.0.0",
	"serverHost": "0.0.0.0",
	"serverPort": 443,
	"rootUser": "user",
	"enableAuthentication": true,
	"enableDocs": true,
	"maxBucketSize": 15,
	"dataStorageType": "jsondb",
	"createdAt": "2025-08-12T19:49:16.9240393+03:30"
}
```

also you can Reset the configs with this command

```
ovacli configs reset
```

## Default Config Template

This config lives on the ova installation folder and it is used as a template for new repositories.
