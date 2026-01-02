package scanner

import (
	"bytes"
	"fmt"
	"os"

	"github.com/abema/go-mp4"
)

func (r *Scanner) GetTestFast(videoPath string) (VideoMetadata, error) {
	f, err := os.Open(videoPath)
	if err != nil {
		return VideoMetadata{}, err
	}
	defer f.Close()

	fileInfo, _ := f.Stat()
	meta := VideoMetadata{
		Format:    "mp4",
		SizeBytes: fileInfo.Size(),
		SizeHuman: FormatBytes(fileInfo.Size()).Human, // Adding your human-readable helper
	}

	// 1. Find the 'moov' box location
	boxes, err := mp4.ExtractBox(f, nil, mp4.BoxPath{mp4.BoxTypeMoov()})
	if err != nil || len(boxes) == 0 {
		return VideoMetadata{}, fmt.Errorf("moov not found")
	}
	moovInfo := boxes[0]

	// 2. Read ONLY the moov box bytes into memory
	moovData := make([]byte, moovInfo.Size)
	_, err = f.ReadAt(moovData, int64(moovInfo.Offset))
	if err != nil {
		return VideoMetadata{}, err
	}

	// 3. Scan the memory-buffered moov data
	_, err = mp4.ReadBoxStructure(bytes.NewReader(moovData), func(h *mp4.ReadHandle) (interface{}, error) {
		boxType := h.BoxInfo.Type.String()

		switch boxType {
		case "mvhd":
			box, _, _ := h.ReadPayload()
			mvhd := box.(*mp4.Mvhd)
			var duration uint64
			if mvhd.Version == 0 {
				duration = uint64(mvhd.DurationV0)
			} else {
				duration = mvhd.DurationV1
			}
			if mvhd.Timescale != 0 {
				meta.DurationSec = int(duration / uint64(mvhd.Timescale))
			}
		case "tkhd":
			box, _, _ := h.ReadPayload()
			tkhd := box.(*mp4.Tkhd)
			if meta.Resolution.Width == 0 {
				meta.Resolution.Width = int(tkhd.Width >> 16)
				meta.Resolution.Height = int(tkhd.Height >> 16)
			}
		// --- Added Codec Detection ---
		case "avc1":
			meta.VideoCodec = "h264"
		case "hev1", "hvc1":
			meta.VideoCodec = "h265"
		case "mp4a":
			meta.AudioCodec = "aac"
		}
		return h.Expand()
	})

	return meta, nil
}
