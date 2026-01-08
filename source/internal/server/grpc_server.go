package server

import (
	"log"
	"net"

	"ova-cli/ovaproto"
	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server/grpcapi" // Import your new package

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type OvaGrpcServer struct {
	Addr       string
	grpcServer *grpc.Server
	handler    *grpcapi.Handler // Use the handler from the other package
}

func NewGrpcServer(repoManager *repo.RepoManager, addr string) *OvaGrpcServer {
	return &OvaGrpcServer{
		Addr:    addr,
		handler: grpcapi.NewHandler(repoManager),
	}
}

func (s *OvaGrpcServer) Run() error {
	lis, err := net.Listen("tcp", s.Addr)
	if err != nil {
		return err
	}

	s.grpcServer = grpc.NewServer()

	// Register the handler
	ovaproto.RegisterOvaServiceServer(s.grpcServer, s.handler)

	// Good practice: Add reflection so tools like Kreya can "see" your API
	reflection.Register(s.grpcServer)

	log.Printf("[gRPC] Started on %s", s.Addr)
	return s.grpcServer.Serve(lis)
}
