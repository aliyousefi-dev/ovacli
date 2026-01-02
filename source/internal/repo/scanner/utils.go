package scanner

import (
	"fmt"
	"strings"
)

func (s *Scanner) IsVideoFile(filename string) bool {
	lower := strings.ToLower(filename)
	for _, ext := range s.VideoExtensions {
		if strings.HasSuffix(lower, ext) {
			return true
		}
	}
	return false
}

// FormatBytes converts an int64 byte count into a human-readable SizeResult.
func FormatBytes(bytes int64) SizeResult {
	const unit = 1024
	if bytes < unit {
		return SizeResult{
			Bytes: bytes,
			Human: fmt.Sprintf("%d B", bytes),
		}
	}

	// Use float64 for the math to keep decimals
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	// "KMGTPE" represents Kilo, Mega, Giga, Tera, Peta, Exa
	suffix := "KMGTPE"[exp]
	return SizeResult{
		Bytes: bytes,
		Human: fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), suffix),
	}
}
