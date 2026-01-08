package cmd

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"ova-cli/source/internal/logs"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server"
	"ova-cli/source/internal/utils"

	"github.com/spf13/cobra"
)

var serveLogger = logs.Loggers("Serve")
var serveApiOnly bool
var bDisableAuth bool
var serveUseHttps bool

var serveCmd = &cobra.Command{
	Use:   "serve <repo-path>",
	Short: "Start the backend API server and WebSocket server",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		repoPath := args[0]

		repoManager, err := repo.NewRepoManager(repoPath)
		if err != nil {
			fmt.Println("Failed to initialize repository:", err)
			return
		}

		repoConfig := repoManager.GetConfigs()
		serverAddr := fmt.Sprintf("%s:%d", repoConfig.ServerHost, repoConfig.ServerPort)

		// Handle Graceful Shutdown
		handleShutdown(repoManager)

		// 1. Launch WebSocket Server in a Goroutine (Non-blocking)
		wsPort := ":8081" // You can also move this to repoConfig
		wsServer := server.NewWsServer(repoManager, wsPort)

		go func() {
			serveLogger.Info("Launching WebSocket Server on %s", wsPort)
			if err := wsServer.Run(); err != nil {
				serveLogger.Error("WebSocket server error: %v", err)
			}
		}()

		// 2. Log Info
		if serveApiOnly {
			serveLogger.Info("serving API at %s", serverAddr)
		} else {
			serveLogger.Info("Serving frontend %s", serverAddr)
			serveLogger.Info("serving api at %s/api/v1", serverAddr)
		}

		printLocalIPs(repoManager)

		// 3. Launch Main Backend Server (Blocking)
		serverInstance := server.NewBackendServer(
			repoManager,
			serverAddr,
			!serveApiOnly,
			!bDisableAuth,
			serveUseHttps,
		)

		if err := serverInstance.Run(); err != nil {
			serveLogger.Error("Server failed to start: %v", err)
			os.Exit(1)
		}
	},
}

func InitCommandServe(rootCmd *cobra.Command) {
	serveCmd.Flags().BoolVarP(&serveApiOnly, "apionly", "a", false, "Serve API only (no frontend)")
	serveCmd.Flags().BoolVar(&bDisableAuth, "noauth", false, "Disable authentication (for testing only)")
	serveCmd.Flags().BoolVar(&serveUseHttps, "https", false, "Enable HTTPS (default is HTTP)")
	rootCmd.AddCommand(serveCmd)
}

func handleShutdown(manager *repo.RepoManager) {
	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-shutdownCh
		serveLogger.Info("Received interrupt signal, shutting down...")
		manager.OnShutdown()
		serveLogger.Info("Cleanup complete. Goodbye!")
		os.Exit(0)
	}()
}

func printLocalIPs(repoManager *repo.RepoManager) {
	localIPs, err := utils.GetLocalIPs()
	if err != nil {
		serveLogger.Warn("Could not determine local IP addresses: %v", err)
	} else {
		for _, ip := range localIPs {
			serveLogger.Info("Server reachable at http://%s:%d/", ip, repoManager.GetConfigs().ServerPort)
		}
	}
}
