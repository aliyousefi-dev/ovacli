package grpcapi

import (
	"log"
	"ova-cli/ovaproto"
	"time"
)

func (h *Handler) StreamProgress(in *ovaproto.ProgressUpdate, stream ovaproto.OvaService_StreamProgressServer) error {
	log.Printf("[gRPC] Streaming progress for %s", in.JobId)

	for i := 1; i <= 5; i++ {
		if stream.Context().Err() != nil {
			return stream.Context().Err()
		}

		resp := &ovaproto.StreamResponse{
			Success:  true,
			Progress: float32(i) * 0.2,
		}
		stream.Send(resp)
		time.Sleep(time.Second)
	}
	return nil
}
