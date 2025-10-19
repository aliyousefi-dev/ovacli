package api

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"

	"ova-cli/source/internal/datatypes"
	"ova-cli/source/internal/repo"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterUploadRoutes(rg *gin.RouterGroup, repoMgr *repo.RepoManager) {
	rg.POST("/upload", uploadVideo(repoMgr))
}

func uploadVideo(repoMgr *repo.RepoManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the accountId from context
		accountId, exists := c.Get("accountId")
		if !exists {
			respondError(c, http.StatusUnauthorized, "Authentication required")
			return
		}

		// Convert accountId to string (in case it's not a string)
		accountIdStr, ok := accountId.(string)
		if !ok {
			respondError(c, http.StatusUnauthorized, "Invalid accountId")
			return
		}

		// Log the accountId
		fmt.Println(accountIdStr)

		basePath := "." // Configurable base path

		// Construct the folder path using the accountId as the folder name
		fullFolderPath := filepath.Join(basePath, accountIdStr)

		// Check if the folder exists
		if !repoMgr.FolderExists(fullFolderPath) {
			// Optionally create the folder if it doesn't exist
			if err := repoMgr.CreateFolder(fullFolderPath); err != nil {
				respondError(c, http.StatusInternalServerError, "Failed to create folder")
				return
			}
		}

		// Get the file from form
		file, err := c.FormFile("file")
		if err != nil {
			respondError(c, http.StatusBadRequest, "Video file is required")
			return
		}

		// Save file in the specified folder with the original name
		savePath := filepath.Join(fullFolderPath, file.Filename)
		log.Printf("Saving file %s to path: %s", file.Filename, savePath)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			log.Printf("SaveUploadedFile error: %v", err)
			respondError(c, http.StatusInternalServerError, "Failed to save video file")
			return
		}
		log.Printf("File saved successfully to %s", savePath)

		// Build minimal video metadata
		video := datatypes.VideoData{
			VideoID:  uuid.New().String(), // You can still use UUID here for video metadata if needed
			FilePath: savePath,
		}

		repoMgr.IndexVideo(savePath, accountIdStr)
		repoMgr.CookOneVideo(savePath)

		respondSuccess(c, http.StatusOK, video, "Video uploaded successfully")
	}
}
