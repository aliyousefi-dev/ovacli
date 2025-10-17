# Checksum

To ensure every video file is uniquely identified, a checksum is generated for each file. This checksum acts as a unique fingerprint, helping to prevent duplicates and enabling reliable file tracking.

---

## Custom SHA-256 Algorithm

for faster checksum generation . we using a custom implementation of the SHA-256 algorithm.

The checksum is generated using a custom implementation of the SHA-256 algorithm. For optimization, the algorithm reads only the first 5MB of the file. If the file is larger than 10MB, it also reads the last 5MB. For files between 5MB and 10MB, it reads the first 5MB and then the remaining bytes. These chunks are concatenated and hashed using SHA-256. This approach significantly speeds up checksum generation for large files while maintaining uniqueness.

## Debug

The following command can be used to generate a checksum for a video file:

```
ovacli checksum <video_path>
```
