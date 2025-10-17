# Video Data

Video dat ai sthe base data that exist from the videos.

---

## Data Structure

```yaml
Video Data:
    - VideoID: string
    - FilePath: string
    - Tags: array of strings
    - Codecs:
        - Format: string
        - DurationSec: integer
        - FrameRate: float
        - IsFragment: boolean
        - VideoCodec: string
        - AudioCodec: string
        - Resolution: object
            - Width: integer
            - Height: integer
    - IsCooked: boolean
    - TotalDownloads: integer
    - UploaderAccountId: string
    - Visibility: string
    - UploadedAt: datetime
```
