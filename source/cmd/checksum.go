package cmd

import (
	"ova-cli/source/internal/filehash"

	"github.com/spf13/cobra"
)

var checksumCmd = &cobra.Command{
	Use:   "checksum <file-path>",
	Short: "Generate a checksum for a video file",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		// Call the server's StartDocServer method

		videoPath := args[0]

		hash, err := filehash.Sha256FileHash(videoPath)
		if err != nil {
			cmd.Println("Error generating checksum:", err)
			return
		}
		cmd.Println("Checksum:", hash)
	},
}

func InitCommandChecksum(rootCmd *cobra.Command) {
	rootCmd.AddCommand(checksumCmd)
}
