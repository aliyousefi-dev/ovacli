package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"ova-cli/source/internal/datastorage/jsondb"
	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"

	"github.com/pterm/pterm"
	"github.com/spf13/cobra"
)

var videoLogger = logs.Loggers("Video")

var videoCmd = &cobra.Command{
	Use:   "video",
	Short: "Manage videos",
	Run: func(cmd *cobra.Command, args []string) {
		videoLogger.Info("Video command invoked: use a subcommand (add, list, info, purge)")
	},
}

// Command to add a single video
var videoAddOneCmd = &cobra.Command{
	Use:   "addone [path]",
	Short: "Add a single video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repository, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Process single video (arg is a specific path)
		absPath, err := filepath.Abs(args[0])
		if err != nil {
			fmt.Println("Failed to get absolute path:", err)
			return
		}

		if _, err := os.Stat(absPath); os.IsNotExist(err) {
			fmt.Printf("Error: Specified file '%s' does not exist.\n", absPath)
			return
		}

		// Get the value of the --cook flag
		cook, _ := cmd.Flags().GetBool("cook")

		// Use AddOneVideo to add the single video
		err = repository.AddOneVideo(absPath, repository.GetRepoOwnerID(), cook)
		if err != nil {
			fmt.Println("Failed to add video:", err)
			return
		}
	},
}

var videoRemoveCmd = &cobra.Command{
	Use:   "remove [path|all]",
	Short: "Remove video(s)",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}

		repository, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		arg := args[0]
		var videoPaths []string

		if arg == "all" {
			confirm, _ := pterm.DefaultInteractiveConfirm.Show("⚠️  Are you sure you want to remove ALL videos?")
			if !confirm {
				pterm.Info.Println("Operation cancelled.")
				return
			}

			videoPaths, err = repository.ScanDiskForVideos()
			if err != nil {
				pterm.Error.Println("Failed to retrieve video paths:", err)
				return
			}
		} else {
			if _, err := os.Stat(arg); os.IsNotExist(err) {
				pterm.Error.Println("Specified file does not exist.")
				return
			}
			absPath, _ := filepath.Abs(arg)
			videoPaths = append(videoPaths, absPath)
		}

		total := len(videoPaths)
		successCount := 0
		var warnings []string

		multi := pterm.DefaultMultiPrinter
		processSpinner, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Initializing...")
		progressbar, _ := pterm.DefaultProgressbar.WithTotal(total).WithWriter(multi.NewWriter()).Start("Removing videos")
		warningStatus, _ := pterm.DefaultSpinner.WithWriter(multi.NewWriter()).Start("Warnings: 0")
		multi.Start()

		for i, absPath := range videoPaths {
			fileName := filepath.Base(absPath)
			processSpinner.UpdateText(fmt.Sprintf("Removing (%d/%d): %s", i+1, total, fileName))

			err := repository.UnIndexVideo(absPath)
			if err != nil {
				warnings = append(warnings, fmt.Sprintf("⚠️  %s: failed to remove: %v", fileName, err))
				warningStatus.UpdateText(fmt.Sprintf("Warnings: %d", len(warnings)))
			} else {
				successCount++
			}

			progressbar.Increment()
			time.Sleep(30 * time.Millisecond)
		}

		processSpinner.Success("All removals processed.")
		progressbar.Stop()
		if len(warnings) > 0 {
			warningStatus.Warning(fmt.Sprintf("Warnings: %d (see below)", len(warnings)))
		} else {
			warningStatus.Success("No warnings.")
		}
		multi.Stop()

		pterm.Println()
		pterm.Success.Printf("✅ Successfully removed %d of %d videos.\n", successCount, total)

		if len(warnings) > 0 {
			pterm.Warning.Println("⚠️  The following removals had issues:")
			for _, warn := range warnings {
				pterm.Println("  " + warn)
			}
		}
	},
}

var videoInfoCmd = &cobra.Command{
	Use:   "info <video-id>",
	Short: "Show information about a video",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		videoID := args[0]

		repoRoot, err := os.Getwd()
		if err != nil {
			pterm.Error.Println("Failed to get working directory:", err)
			return
		}
		repoPath := filepath.Join(repoRoot, ".ova-repo")
		storageDir := filepath.Join(repoPath, "storage")

		st := jsondb.NewJsonDB(storageDir)

		video, err := st.GetVideoByID(videoID)
		if err != nil {
			pterm.Error.Printf("Error finding video: %v\n", err)
			return
		}

		pterm.Info.Println("Video Info:")
		pterm.DefaultSection.Println("ID:", video.VideoID)
		pterm.DefaultSection.Println("File Path:", video.Title)
		pterm.DefaultSection.Println("Duration (seconds):", fmt.Sprintf("%d", video.Codecs.DurationSec))
		pterm.DefaultSection.Println("Tags:", fmt.Sprintf("%v", video.Tags))
		pterm.DefaultSection.Println("Uploaded At:", video.UploadedAt.Format(time.RFC3339))
	},
}

func InitCommandVideo(rootCmd *cobra.Command) {

	videoAddOneCmd.Flags().Bool("cook", false, "Cook video after adding (default: false)")

	videoCmd.AddCommand(videoAddOneCmd)

	videoCmd.AddCommand(videoInfoCmd)
	videoCmd.AddCommand(videoRemoveCmd)

	rootCmd.AddCommand(videoCmd)
}
