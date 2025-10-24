# Generate Self Certification

ova also support the internal self certification generation with internall openssl.

---

## How it Works

you can create a CA and then share that on the devices and clients.
It allows you to create self-signed certificates for your internal services.

### Generate Ca

Generate the RSA key and CA certificate in the SSL folder

```
  ovacli ssl generate-ca
```

### Generate Certs

Generate a certificate using the CA's key and certificate

```
 ovacli ssl generate-cert
```
