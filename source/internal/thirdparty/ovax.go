package thirdparty

import (
	"os/exec"
)

func GetOvaxVersion() (string, error) {
	ovaxPath, err := GetOvaxPath() // Get the path for Ovax
	if err != nil {
		return "", err // Return empty string and the error if path cannot be found
	}

	// Run the Ovax command with the --version flag (or whatever flag you use for version)
	cmd := exec.Command(ovaxPath, "--version") // Assuming the Ovax command takes --version to get the version
	output, err := cmd.Output()                // Execute the command and capture the output
	if err != nil {
		return "", err // Return empty string and the error if the command fails
	}

	// Assuming output is a string like "Ovax version 1.2.3" or similar, we will parse the version
	// Example: output = "Ovax version 1.2.3"
	outputStr := string(output)

	// Return the version as a string
	return outputStr, nil
}

func ScanOvax(scanPath string) (string, error) {
	// Get the path for Ovax executable
	ovaxPath, err := GetOvaxPath()
	if err != nil {
		return "", err // Return empty string and the error if path cannot be found
	}

	// Run the Ovax scan command with the specified path and the -s flag
	cmd := exec.Command(ovaxPath, "scan", scanPath, "-s") // Scan command with the path and -s flag
	output, err := cmd.Output()                           // Execute the command and capture the output
	if err != nil {
		return "", err // Return empty string and the error if the command fails
	}

	// Convert output to string
	outputStr := string(output)

	// Return the result of the scan as a string
	return outputStr, nil
}
