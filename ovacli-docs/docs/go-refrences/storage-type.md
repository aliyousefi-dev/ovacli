<!--
{
	"nav_order": 2
}
-->

# Storage Type

ova provides multiple storage types to manage and persist your data efficiently. Each storage type is designed for different use cases, from development and debugging to production environments. Below is an overview of the available storage types and their intended purposes.

### Built-in Storage Types

ova supports two type for saving the data.

### JsonDB

its an readable format and very good for debugging and finding the issue

```json
{
	"storagetype": "jsondb"
}
```

### BoltDB

this format is best for productin and large database.

```json
{
	"storagetype": "boltdb"
}
```
