package grpcapi

import (
	"context"
	"log"
	"ova-cli/ovaproto"
	"time"
)

func (h *Handler) Heartbeat(ctx context.Context, in *ovaproto.HeartbeatRequest) (*ovaproto.HeartbeatResponse, error) {
	// 1. Record the current time for this worker ID
	h.WorkerHealth.Store(in.WorkerId, time.Now())

	// 2. Log it (optional, for debugging)
	log.Printf("[gRPC] Heartbeat received from %s (CPU: %.2f%%)", in.WorkerId, in.CpuUsage)

	return &ovaproto.HeartbeatResponse{
		Status: true,
	}, nil
}
