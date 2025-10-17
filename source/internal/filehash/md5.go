package filehash

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"
)

// Using MD5
func Md5FileHash(filePath string) (string, error) {
	const bufferSize = 64 * 1024 // 64KB
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()
	hasher := md5.New()
	reader := bufio.NewReaderSize(file, bufferSize)
	if _, err := io.Copy(hasher, reader); err != nil {
		return "", err
	}
	return hex.EncodeToString(hasher.Sum(nil)), nil
}
