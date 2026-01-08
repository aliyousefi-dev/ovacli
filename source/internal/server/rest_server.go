package server

import (
	"net/http"
	"os"
	"path/filepath"

	"ova-cli/source/internal/repo"
	"ova-cli/source/internal/server/api"

	"github.com/gin-gonic/gin"
)

type OvaServer struct {
	RepoManager   *repo.RepoManager
	router        *gin.Engine
	ServeFrontend bool
	UseHttps      bool
	Addr          string
}

// NewBackendServer creates and configures the unified server.
func NewBackendServer(
	repoManager *repo.RepoManager,
	addr string,
	serveFrontend bool,
	enableAuth bool,
	useHttps bool,
) *OvaServer {
	gin.SetMode(gin.ReleaseMode)

	repoManager.AuthEnabled = enableAuth

	return &OvaServer{
		RepoManager:   repoManager,
		router:        gin.Default(),
		ServeFrontend: serveFrontend,
		UseHttps:      useHttps,
		Addr:          addr,
	}
}

func (s *OvaServer) initRoutes() {
	s.router.Use(api.CORSMiddleware())

	publicPaths := map[string]bool{
		"/api/v1/auth/login": true,
		"/api/v1/status":     true,
	}
	publicPrefixes := []string{
		"/api/v1/download/",
	}

	v1 := s.router.Group("/api/v1")
	v1.Use(api.AuthMiddleware(s.RepoManager, publicPaths, publicPrefixes))

	api.RegisterAuthRoutes(v1, s.RepoManager)
	api.RegisterUserPlaylistRoutes(v1, s.RepoManager)
	api.RegisterUserSavedRoutes(v1, s.RepoManager)
	api.RegisterVideoRoutes(v1, s.RepoManager)
	api.RegisterSearchRoutes(v1, s.RepoManager)
	api.RegisterVideoTagRoutes(v1, s.RepoManager)
	api.RegisterStreamRoutes(v1, s.RepoManager)
	api.RegisterDownloadRoutes(v1, s.RepoManager)
	api.RegisterUploadRoutes(v1, s.RepoManager)
	api.RegisterGlobalFiltersRoute(v1, s.RepoManager)
	api.RegisterProfileRoutes(v1, s.RepoManager)
	api.RegisterThumbnailRoutes(v1, s.RepoManager)
	api.RegisterPreviewRoutes(v1, s.RepoManager)
	api.RegisterUserWatchedRoutes(v1, s.RepoManager)
	api.RegisterUserPlaylistContentRoutes(v1, s.RepoManager)
	api.RegisterStoryboardRoutes(v1, s.RepoManager)
	api.RegisterMarkerRoutes(v1, s.RepoManager)
	api.RegisterLatestVideoRoute(v1, s.RepoManager)
	api.RegisterSearchSuggestionsRoutes(v1, s.RepoManager)
	api.RegisterBatchRoutes(v1, s.RepoManager)
	api.RegisterStatusRoute(v1)

	if s.ServeFrontend {
		s.serveFrontendStatic()
	}
}

func getFrontendPath() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	exeDir := filepath.Dir(exePath)
	webPath := filepath.Join(exeDir, "web")
	return webPath, nil
}

func (s *OvaServer) serveFrontendStatic() {
	frontendPath, err := getFrontendPath()
	if err != nil {
		panic("Failed to get frontend path: " + err.Error())
	}

	fs := http.FileServer(http.Dir(frontendPath))
	s.router.NoRoute(func(c *gin.Context) {
		path := filepath.Join(frontendPath, c.Request.URL.Path)
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			fs.ServeHTTP(c.Writer, c.Request)
			return
		}
		c.File(filepath.Join(frontendPath, "index.html"))
	})
}

func (s *OvaServer) Run() error {
	s.initRoutes()

	// mDNS service advertisement removed

	if s.UseHttps {
		// Get the SSL folder path using GetSSLPath()
		sslFolderPath := s.RepoManager.GetSSLPath()

		// Set the cert and key file paths
		certFile := filepath.Join(sslFolderPath, "cert.pem")
		keyFile := filepath.Join(sslFolderPath, "cert-key.pem")

		return s.router.RunTLS(s.Addr, certFile, keyFile)
	}
	return s.router.Run(s.Addr)
}
