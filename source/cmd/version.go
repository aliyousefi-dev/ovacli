package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Version represents the version of your application
const Version = "0.1-beta"

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("ovacli version %s\n", Version)
	},
}

func InitCommandVersion(rootCmd *cobra.Command) {
	rootCmd.AddCommand(versionCmd)
}
