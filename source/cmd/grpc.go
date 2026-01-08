package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server"

	"github.com/spf13/cobra"
)

var grpcCmd = &cobra.Command{
	Use:   "grpc",
	Short: "Start the gRPC server",
	Run: func(cmd *cobra.Command, args []string) {

		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		grpcServer := server.NewGrpcServer(repoManager, ":50051")
		if err := grpcServer.Run(); err != nil {
			fmt.Println("gRPC server error:", err)
		}
	},
}

func InitCommandGrpc(rootCmd *cobra.Command) {
	rootCmd.AddCommand(grpcCmd)
}
