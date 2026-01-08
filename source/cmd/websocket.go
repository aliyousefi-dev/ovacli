package cmd

import (
	"fmt"
	"os"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server"

	"github.com/spf13/cobra"
)

var websocketCmd = &cobra.Command{
	Use:   "websocket",
	Short: "Start the dedicated WebSocket server for real-time dashboard updates",
	Run: func(cmd *cobra.Command, args []string) {

		repoRoot, err := os.Getwd()
		if err != nil {
			fmt.Println("Failed to get working directory:", err)
			return
		}

		// Initialize RepoManager (Badger DB, Settings, etc.)
		repoManager, err := repo.NewRepoManager(repoRoot)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		// Initialize the WebSocket server on port 8081
		// We pass the repoManager so the WS server can access the database
		wsServer := server.NewWsServer(repoManager, ":8081")

		fmt.Println("[WS] Launching WebSocket Server on :8081...")

		// Run is a blocking call
		if err := wsServer.Run(); err != nil {
			fmt.Println("WebSocket server error:", err)
		}
	},
}

// InitCommandWebsocket adds the websocket command to the main application
func InitCommandWebsocket(rootCmd *cobra.Command) {
	rootCmd.AddCommand(websocketCmd)
}
