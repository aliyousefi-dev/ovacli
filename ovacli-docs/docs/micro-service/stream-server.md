# Stream Server

> this is part of Micro Services for Larger scale video Archives.

Download Server is an Instance that attach to a ova repository and handle video downloading tasks. it good for better traffic management and performance. by default ova use the defualt internal download server . you can configure it to use an external download server.

---

## Default Download Server

The default download server is an internal instance that handles all video downloading tasks. It is automatically configured when you set up your OVA repository.

## External Download Server

You can configure an external download server by specifying its URL and any required authentication credentials in the OVA configuration file. This allows you to offload video downloading tasks to a separate server, which can help improve performance and scalability.

for example you can run two download server instance.
