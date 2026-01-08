package main

import (
	"ova-cli/source/cmd"

	"github.com/spf13/cobra"
)

func main() {

	var rootCmd = &cobra.Command{
		Use:   "ovacli",
		Short: "OVA CLI — a command-line interface for managing video collections",
		Long: `OVA CLI provides a command-line interface for managing video collections,
including features for video processing, metadata management, and more.`,
	}

	// common commands
	cmd.InitCommandInit(rootCmd)
	cmd.InitCommandTools(rootCmd)
	cmd.InitCommandCook(rootCmd)
	cmd.InitCommandRepo(rootCmd)
	cmd.InitCommandPurge(rootCmd)
	cmd.InitCommandTsConvert(rootCmd)
	cmd.InitCommandStatus(rootCmd)
	cmd.InitCommandIndex(rootCmd)
	cmd.InitCommandChecksum(rootCmd)
	cmd.InitCommandTest(rootCmd)
	cmd.InitCommandGrpc(rootCmd)

	cmd.InitCommandSSL(rootCmd)

	// server commands
	cmd.InitCommandServe(rootCmd)

	// storage commands
	cmd.InitCommandVideo(rootCmd)
	cmd.InitCommandUsers(rootCmd)

	cmd.InitCommandConfig(rootCmd)

	// version command
	cmd.InitCommandVersion(rootCmd)
	cmd.InitCommandDebug(rootCmd)

	rootCmd.Execute()
}
