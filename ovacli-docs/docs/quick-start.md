<!--
{
	"nav_order": 2
}
-->

# Quick Start Guide

here we can work on thing that we can do more.

### Initialize Your Repository

Select your target folder and run:

```batch
ovacli init .
```

> By default it create an `root` user and you need select a password for that.

### Index Your Videos

Scan and index all available videos in the selected folder:

```batch
ovacli index --all
```

This command will search for videos and add them to your database.

### Start Server

Launch the server with:

```batch
ovacli serve .
```
