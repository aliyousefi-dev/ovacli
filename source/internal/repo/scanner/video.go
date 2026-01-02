package scanner

import (
	"os"
	"path/filepath"
	"runtime"
	"sync"
)

func (s *Scanner) GetVideos() ([]string, error) {
	var videos []string
	err := filepath.Walk(s.rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if info.Name() == ".ova-server" {
				return filepath.SkipDir
			}
			return nil
		}
		if s.IsVideoFile(info.Name()) {
			normalizedPath := filepath.ToSlash(path)
			videos = append(videos, normalizedPath)
		}
		return nil
	})
	return videos, err
}

func (s *Scanner) GetDetailedVideos() ([]VideoInfo, error) {
	paths, err := s.GetVideos()
	if err != nil {
		return nil, err
	}

	// 1. Setup channels and Worker Count
	// Use number of CPU cores, or a fixed number like 8 for disk I/O
	numWorkers := runtime.NumCPU()
	jobs := make(chan string, len(paths))
	results := make(chan VideoInfo, len(paths))
	var wg sync.WaitGroup

	// 2. Start the Workers
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for path := range jobs {
				// We use the fast method here
				meta, err := s.GetTestFast(path)
				if err != nil {
					continue // Skip files that fail
				}
				results <- VideoInfo{
					Path:     path,
					Metadata: meta,
				}
			}
		}()
	}

	// 3. Send the jobs
	for _, path := range paths {
		jobs <- path
	}
	close(jobs) // Important: workers stop when jobs channel is closed

	// 4. Wait for workers and close results in a separate goroutine
	go func() {
		wg.Wait()
		close(results)
	}()

	// 5. Collect results
	var detailedVideos []VideoInfo
	for video := range results {
		detailedVideos = append(detailedVideos, video)
	}

	return detailedVideos, nil
}
