package cmd

import (
	"fmt"
	"ova-cli/source/version"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("ovacli version %s\n", version.Version)
	},
}

func InitCommandVersion(rootCmd *cobra.Command) {
	rootCmd.AddCommand(versionCmd)
}
