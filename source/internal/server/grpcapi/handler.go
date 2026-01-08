package grpcapi

import (
	"ova-cli/ovaproto"
	"ova-cli/source/internal/repo"
	"sync"
)

// Handler implements the OvaServiceServer interface
type Handler struct {
	ovaproto.UnimplementedOvaServiceServer
	RepoManager  *repo.RepoManager
	WorkerHealth sync.Map
}

func NewHandler(repo *repo.RepoManager) *Handler {
	return &Handler{
		RepoManager: repo,
	}
}
