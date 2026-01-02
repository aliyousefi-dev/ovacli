package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"ova-cli/source/internal/repo/scanner"
	"time"

	// Assuming you have the GetVideoDetails function in this package
	"github.com/spf13/cobra"
	// Assuming the datatypes package contains VideoResolution struct
)

// debugCmd is the root debug command
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Print debugging information for the application",
}

var scannertestCMD = &cobra.Command{
	Use:   "scan",
	Short: "Scan the specified path for video files and group them by folder structure",
	Run: func(cmd *cobra.Command, args []string) {

		currentPath, err := os.Getwd()
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		// 2. Start the timer
		startTime := time.Now()

		scanner, err := scanner.NewScanner(currentPath)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		videos, err := scanner.GetDetailedVideos()
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		// 3. Calculate elapsed time
		elapsed := time.Since(startTime)

		// --- JSON PRINTING LOGIC ---

		jsonData, err := json.MarshalIndent(videos, "", "    ")
		if err != nil {
			fmt.Println("Failed to generate JSON:", err)
			return
		}

		fmt.Println(string(jsonData))

		// 4. Print the final statistics
		fmt.Println("---------------------------------------")
		fmt.Printf("Scan complete! Found %d videos.\n", len(videos))
		fmt.Printf("Elapsed time: %s\n", elapsed)
		fmt.Println("---------------------------------------")
	},
}

func InitCommandTest(rootCmd *cobra.Command) {
	rootCmd.AddCommand(testCmd)

	testCmd.AddCommand(scannertestCMD)
}
