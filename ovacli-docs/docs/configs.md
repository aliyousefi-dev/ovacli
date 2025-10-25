# Configs

When you create a ova repository it create an `.ova-repo` folder inside that folder. you can find the `configs.json` and change that.

---

## Default Config

you can see the default port and ip and configs that ova create automatically them.

```json
{
	"ovacli": "0.1-beta",
	"serverHost": "0.0.0.0",
	"serverPort": 443,
	"rootUser": "71df752c-4292-4e82-8d4c-9b4350e50be4",
	"enableAuth": true,
	"maxBucketSize": 30,
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
