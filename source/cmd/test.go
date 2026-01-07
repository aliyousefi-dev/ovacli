package cmd

import (
	"fmt"
	"ova-cli/source/internal/thirdparty"

	// Assuming you have the GetVideoDetails function in this package
	"github.com/spf13/cobra"
	// Assuming the datatypes package contains VideoResolution struct
)

// debugCmd is the root debug command
var testCmd = &cobra.Command{
	Use:   "test",
	Short: "Print debugging information for the application",
}

var ovaxcmd = &cobra.Command{
	Use:   "ovax",
	Short: "test",
	Run: func(cmd *cobra.Command, args []string) {
		version, err := thirdparty.ScanOvax("e:\\PP")
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		fmt.Println(version)
	},
}

func InitCommandTest(rootCmd *cobra.Command) {
	rootCmd.AddCommand(testCmd)

	testCmd.AddCommand(ovaxcmd)
}
