package repo

import (
	"fmt"
	"os"
	"ova-cli/source/internal/datatypes"
	"path/filepath"
	"sort"
	"strings"
)

func (r *RepoManager) AddMarkerToVideo(videoID string, marker datatypes.VideoMarker) error {
	// Calculate file path for the VTT marker file
	filePath := r.GetVideoMarkerFilePathByVideoID(videoID)

	// Ensure the directory exists before adding the marker
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create marker directory %s: %w", dir, err)
	}

	// Fetch existing markers and add the new one
	markers, err := r.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	markers = append(markers, marker)
	return r.saveMarkersToVTT(videoID, markers)
}

func (r *RepoManager) GetMarkersForVideo(videoID string) ([]datatypes.VideoMarker, error) {
	// Calculate the file path for the VTT marker file dynamically
	filePath := r.GetVideoMarkerFilePathByVideoID(videoID)

	// Read the VTT file and extract markers
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []datatypes.VideoMarker{}, nil // Return empty list if the file does not exist
		}
		return nil, err
	}

	content := string(data)
	lines := strings.Split(content, "\n")

	var markers []datatypes.VideoMarker
	state := 0 // 0: initial, 1: after WEBVTT/blank, 2: reading title
	var currentStartVTT string
	var currentTitle string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		switch state {
		case 0:
			if line == "WEBVTT" {
				state = 1
				continue
			} else {
				return nil, fmt.Errorf("invalid VTT file: missing WEBVTT header")
			}
		case 1: // Expecting cue timing (e.g., "00:00:00.000 --> 00:00:10.000")
			if strings.Contains(line, "-->") {
				parts := strings.Split(line, " --> ")
				if len(parts) != 2 {
					return nil, fmt.Errorf("invalid cue timing: %s", line)
				}
				currentStartVTT = parts[0]
				state = 2
			} else {
				continue // Skip cue id or other non-timing lines
			}
		case 2: // Expecting marker title
			currentTitle = line
			h, m, s, err := datatypes.ParseVTTToHMS(currentStartVTT)
			if err != nil {
				return nil, fmt.Errorf("failed to parse VTT timestamp '%s': %w", currentStartVTT, err)
			}
			markers = append(markers, datatypes.VideoMarker{
				Hour:   h,
				Minute: m,
				Second: s,
				Title:  currentTitle,
			})
			state = 1
		}
	}

	return markers, nil
}

func (r *RepoManager) DeleteMarkerFromVideo(videoID string, markerToDelete datatypes.VideoMarker) error {
	// Get markers for the video
	markers, err := r.GetMarkersForVideo(videoID)
	if err != nil {
		return err
	}

	// Format the timestamp for the marker to be deleted
	targetVTTTimestamp := datatypes.FormatHMSToVTT(markerToDelete.Hour, markerToDelete.Minute, markerToDelete.Second)

	// Filter out the marker to delete
	var filtered []datatypes.VideoMarker
	var markerDeleted bool
	for _, m := range markers {
		storedVTTTimestamp := datatypes.FormatHMSToVTT(m.Hour, m.Minute, m.Second)
		if storedVTTTimestamp == targetVTTTimestamp {
			// Skip the marker to delete
			markerDeleted = true
			continue
		}
		// Keep other markers
		filtered = append(filtered, m)
	}

	if !markerDeleted {
		return fmt.Errorf("marker with timestamp '%s' not found for deletion", targetVTTTimestamp)
	}

	// Re-save the remaining markers back to the VTT file
	return r.saveMarkersToVTT(videoID, filtered)
}

func (r *RepoManager) DeleteAllMarkersFromVideo(videoID string) error {
	// Calculate the file path for the VTT marker file
	filePath := r.GetVideoMarkerFilePathByVideoID(videoID)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (r *RepoManager) saveMarkersToVTT(videoID string, markers []datatypes.VideoMarker) error {
	// Sort markers by total seconds
	sort.Slice(markers, func(i, j int) bool {
		return markers[i].ConvertToSeconds() < markers[j].ConvertToSeconds()
	})

	// Use GetVideoMarkerFilePathByVideoID to get the correct file path
	filePath := r.GetVideoMarkerFilePathByVideoID(videoID)

	// Ensure the directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	// Get video duration in seconds from video data
	var videoDuration float64 = 600 // fallback default to 10 minutes
	videoData, err := r.GetVideoByID(videoID)
	if err == nil && videoData != nil {
		if videoData.Codecs.DurationSec > 0 {
			videoDuration = float64(videoData.Codecs.DurationSec)
		}
	}

	// Calculate offset based on a ratio of video duration (e.g., 3%)
	const ratio = 0.03
	const minOffset = 0.2  // minimum 0.2 seconds offset
	const maxOffset = 15.0 // max 15 seconds offset

	offsetSeconds := videoDuration * ratio
	if offsetSeconds < minOffset {
		offsetSeconds = minOffset
	} else if offsetSeconds > maxOffset {
		offsetSeconds = maxOffset
	}

	var sb strings.Builder
	sb.WriteString("WEBVTT\n\n")

	// Write markers to the VTT file
	for _, marker := range markers {
		startSeconds := marker.ConvertToSeconds()
		endSeconds := startSeconds + offsetSeconds

		// Format start and end time with milliseconds
		totalStartMillis := int(startSeconds * 1000)
		startH := totalStartMillis / (3600 * 1000)
		startM := (totalStartMillis % (3600 * 1000)) / (60 * 1000)
		startS := (totalStartMillis % (60 * 1000)) / 1000
		startMS := totalStartMillis % 1000
		startVTT := fmt.Sprintf("%02d:%02d:%02d.%03d", startH, startM, startS, startMS)

		// Format end time with milliseconds
		totalEndMillis := int(endSeconds * 1000)
		endH := totalEndMillis / (3600 * 1000)
		endM := (totalEndMillis % (3600 * 1000)) / (60 * 1000)
		endS := (totalEndMillis % (60 * 1000)) / 1000
		endMS := totalEndMillis % 1000
		endVTT := fmt.Sprintf("%02d:%02d:%02d.%03d", endH, endM, endS, endMS)

		sb.WriteString(fmt.Sprintf("%s --> %s\n", startVTT, endVTT))
		sb.WriteString(marker.Title + "\n\n")
	}

	return os.WriteFile(filePath, []byte(sb.String()), 0644)
}
