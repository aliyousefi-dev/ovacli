package grpcapi

import (
	"context"
	"ova-cli/ovaproto"
)

func (h *Handler) SayHello(ctx context.Context, in *ovaproto.HelloRequest) (*ovaproto.HelloResponse, error) {
	// چون پیام فعلاً فیلدی ندارد، از متغیر 'in' استفاده نمی‌کنیم
	return &ovaproto.HelloResponse{
		Message: "Hello! Everything is working perfectly.",
	}, nil
}
