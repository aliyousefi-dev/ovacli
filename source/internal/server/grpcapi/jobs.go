package grpcapi

import (
	"context"
	"log"
	"ova-cli/ovaproto"
)

func (h *Handler) GetNextJob(ctx context.Context, in *ovaproto.WorkerInfo) (*ovaproto.Job, error) {
	log.Printf("[gRPC] Worker %s requesting job", in.WorkerId)

	// You can now use h.RepoManager to query your database
	return &ovaproto.Job{
		JobId:     "task-101",
		VideoPath: "/data/input.mp4",
	}, nil
}
