package cmd

import (
	// Assuming you have the GetVideoDetails function in this package

	"fmt"
	"os"
	"ova-cli/source/internal/repo"

	"github.com/spf13/cobra"
	// Assuming the datatypes package contains VideoResolution struct
)

// debugCmd is the root debug command
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Print debugging information for the application",
}

var ovaxcmd = &cobra.Command{
	Use:   "playlist",
	Short: "test",
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

		repManager.AddVideoToPlaylist("new", "NpSQovGz3h0", "new")
	},
}

func InitCommandTest(rootCmd *cobra.Command) {
	rootCmd.AddCommand(testCmd)

	testCmd.AddCommand(ovaxcmd)
}
