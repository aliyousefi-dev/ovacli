package server

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"ova-cli/source/internal/repo" // Ensure this path is correct
	wstypes "ova-cli/source/internal/server/ws-types"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

type WsServer struct {
	Addr        string
	RepoManager *repo.RepoManager // Added RepoManager access
	clients     map[*websocket.Conn]bool
	broadcast   chan interface{}
	mu          sync.Mutex
}

// NewWsServer now accepts the repoManager
func NewWsServer(repoManager *repo.RepoManager, addr string) *WsServer {
	return &WsServer{
		Addr:        addr,
		RepoManager: repoManager,
		clients:     make(map[*websocket.Conn]bool),
		broadcast:   make(chan interface{}),
	}
}

// Run starts the dedicated HTTP server for WebSockets
func (s *WsServer) Run() error {
	go s.listenToBroadcast()

	go s.startHeartbeat()

	mux := http.NewServeMux()

	// WebSocket endpoint
	mux.HandleFunc("/ws", s.HandleConnections)

	// Hello endpoint that uses RepoManager to show some info
	mux.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		// Example: Using RepoManager to show if Auth is enabled
		status := "Disabled"
		if s.RepoManager.AuthEnabled {
			status = "Enabled"
		}
		fmt.Fprintf(w, "Hello! WS Server is on %s. Auth is %s", s.Addr, status)
	})

	log.Printf("[WS] Server started on %s", s.Addr)
	return http.ListenAndServe(s.Addr, mux)
}

func (s *WsServer) listenToBroadcast() {
	for {
		msg := <-s.broadcast
		s.mu.Lock()
		for client := range s.clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("[WS] Error writing JSON: %v", err)
				client.Close()
				delete(s.clients, client)
			}
		}
		s.mu.Unlock()
	}
}
func (s *WsServer) HandleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}
	defer conn.Close()

	s.mu.Lock()
	s.clients[conn] = true
	s.mu.Unlock()

	log.Printf("[WS] new connection: %s", r.RemoteAddr)

	for {
		// CHANGED: Use the struct instead of map[string]string
		var req wstypes.WsRequest
		if err := conn.ReadJSON(&req); err != nil {
			log.Printf("[WS] Read/Parse Error: %v", err) // This will now show you the specific error
			s.mu.Lock()
			delete(s.clients, conn)
			s.mu.Unlock()
			break
		}

		// Handle based on req.Action
		if req.Action == "hello" {
			// Using your helper to send a success response back
			response := wstypes.NewWsSuccess("hello_response", map[string]string{
				"storage": s.RepoManager.GetSSLPath(),
			}, "Hello from WebSocket Server!")

			conn.WriteJSON(response)
		}
	}
}
func (s *WsServer) SendUpdate(data interface{}) {
	s.broadcast <- data
}

func (s *WsServer) startHeartbeat() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	// S1000 Fix: Use range instead of select for single-channel loops
	for t := range ticker.C {
		msg := wstypes.NewWsSuccess("heartbeat", t.Unix(), "server is alive")
		s.SendUpdate(msg)
	}
}
