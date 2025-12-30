package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"path/filepath"
	"sync"
	"time"

	"github.com/spf13/cobra"
)

var indexCmd = &cobra.Command{
	Use:   "index",
	Short: "Index all videos from disk",
	Run: func(cmd *cobra.Command, args []string) {
		currentPath, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repManager, err := repo.NewRepoManager(currentPath)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		ownerID := repManager.GetRepoOwnerID()

		// Step 1: Scan
		fmt.Println("Scanning disk for videos...")
		videoPaths, err := repManager.ScanDiskForVideos()
		if err != nil {
			fmt.Printf("Error scanning disk: %v\n", err)
			return
		}

		totalVideos := len(videoPaths)
		if totalVideos == 0 {
			fmt.Println("No videos found to process.")
			return
		}

		fmt.Printf("Found %d videos. Starting indexing...\n", totalVideos)

		// Step 2: Prepare Logging
		logDir := repManager.GetLogDir()
		if err := os.MkdirAll(logDir, 0755); err != nil {
			fmt.Printf("Failed to create log directory: %v\n", err)
			return
		}

		logFileName := fmt.Sprintf("indexing_%s.log", time.Now().Format("20060102_150405"))
		logFilePath := filepath.Join(logDir, logFileName)
		logFile, err := os.Create(logFilePath)
		if err != nil {
			fmt.Printf("Failed to create log file: %v\n", err)
			return
		}
		defer logFile.Close()

		// Step 3: Setup Channels
		indexingProgressChan := make(chan int)
		indexingErrorChan := make(chan error)

		var wg sync.WaitGroup
		errorCount := 0

		// Handle progress
		wg.Add(1)
		go func() {
			defer wg.Done()
			for progress := range indexingProgressChan {
				fmt.Printf("\rIndexing Progress: %3d%%", progress)
			}
		}()

		// Handle error logging to file
		wg.Add(1)
		go func() {
			defer wg.Done()
			for err := range indexingErrorChan {
				errorCount++
				// Write error to the file with a timestamp
				timestamp := time.Now().Format("15:04:05")
				fmt.Fprintf(logFile, "[%s] ERROR: %v\n", timestamp, err)
			}
		}()

		// Step 4: Run Indexing
		repManager.IndexMultiVideos(
			videoPaths,
			ownerID,
			indexingProgressChan,
			indexingErrorChan,
		)

		wg.Wait()

		// Final output
		fmt.Printf("\rIndexing Progress: 100%%\n\n")

		fmt.Println("Indexing Summary")
		fmt.Println("================")
		fmt.Printf("Total videos: %d\n", totalVideos)
		fmt.Printf("Errors encountered: %d\n", errorCount)

		if errorCount > 0 {
			fmt.Printf("Detailed logs saved to: %s\n", logFilePath)
		}
	},
}

func InitCommandIndex(rootCmd *cobra.Command) {
	rootCmd.AddCommand(indexCmd)
}
