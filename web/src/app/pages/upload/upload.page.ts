import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadApiService } from '../../../services/ova-backend-service/upload-api.service';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Define a structure to hold file and its upload status/progress
interface UploadFile {
  file: File;
  progress: number;
  // Added 'PROCESSING' to the status type
  status: 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  uploadSub: Subscription | null;
  processingTimeoutId?: ReturnType<typeof setTimeout>;
}

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.page.html',
})
export class UploadPage {
  selectedFiles: UploadFile[] = [];
  dragging = false;
  // This flag now only manages the sequential *upload* queue, not the processing queue.
  private isUploading = false;

  constructor(private uploadApi: UploadApiService) {}

  // Helper to format file size
  formatSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Total progress for the header (based on COMPLETED and PROCESSING files)
  get totalUploadProgress(): number {
    if (this.selectedFiles.length === 0) return 0;

    // Count completed or processing files as "done" for the overall progress bar
    const completedCount = this.selectedFiles.filter(
      (f) => f.status === 'COMPLETED' || f.status === 'PROCESSING'
    ).length;
    const totalCount = this.selectedFiles.length;

    return Math.round((completedCount / totalCount) * 100);
  }

  get pendingFiles(): UploadFile[] {
    // Return PENDING, UPLOADING, and FAILED files
    return this.selectedFiles.filter(
      (f) =>
        f.status === 'PENDING' ||
        f.status === 'UPLOADING' ||
        f.status === 'FAILED'
    );
  }

  get completedFiles(): UploadFile[] {
    return this.selectedFiles.filter((f) => f.status === 'COMPLETED');
  }

  get processingFiles(): UploadFile[] {
    return this.selectedFiles.filter((f) => f.status === 'PROCESSING');
  }

  // --- File Selection/Drop Handlers (Omitted for brevity, unchanged) ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  addFiles(files: File[]): void {
    const newFiles: UploadFile[] = [];
    files.forEach((file) => {
      if (file.type.startsWith('video/mp4')) {
        newFiles.push({
          file: file,
          progress: 0,
          status: 'PENDING',
          uploadSub: null,
        });
      } else {
        console.warn(`File ${file.name} ignored: Only MP4 videos are allowed.`);
      }
    });
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }
  // --- End File Selection/Drop Handlers ---

  // --- Control Button Handlers ---

  /**
   * Starts the sequential upload process if not already running.
   */
  uploadAll(): void {
    if (this.isUploading) {
      return;
    }

    const fileToUpload = this.selectedFiles.find(
      (f) => f.status === 'PENDING' || f.status === 'FAILED'
    );

    if (fileToUpload) {
      this.isUploading = true;
      this.uploadFile(fileToUpload);
    }
  }

  /**
   * Tries to start the next upload in the queue.
   */
  private startNextUpload(): void {
    const nextFile = this.selectedFiles.find(
      (f) => f.status === 'PENDING' || f.status === 'FAILED'
    );

    if (nextFile) {
      this.uploadFile(nextFile);
    } else {
      // No more files to upload, end the sequence
      this.isUploading = false;
      console.log('All available uploads completed.');
    }
  }

  /**
   * Initiates the upload for a single file.
   */
  uploadFile(uploadFile: UploadFile): void {
    uploadFile.status = 'UPLOADING';
    uploadFile.progress = 0;

    const subscription = this.uploadApi
      .uploadVideo(uploadFile.file)
      .pipe(
        finalize(() => {
          uploadFile.uploadSub = null;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            uploadFile.progress = Math.round(
              (event.loaded / event.total) * 100
            );
          } else if (event.type === HttpEventType.Response) {
            // 1. Upload complete, move to PROCESSING stage
            uploadFile.status = 'PROCESSING';
            uploadFile.progress = 100;

            // *** START NEXT UPLOAD IMMEDIATELY AFTER UPLOAD COMPLETES ***
            this.startNextUpload();

            console.log(
              `Upload complete, starting processing: ${uploadFile.file.name}`
            );
            // 2. Start the processing timer (independent of the upload sequence)
            this.simulateProcessing(uploadFile);
          }
        },
        error: (err) => {
          console.error(`Upload failed for ${uploadFile.file.name}`, err);
          uploadFile.status = 'FAILED';
          uploadFile.progress = 0;
          // Start the next file on failure
          this.startNextUpload();
        },
      });

    uploadFile.uploadSub = subscription;
  }

  /**
   * Simulates server-side processing for 10 seconds (10000ms).
   * NOTE: This does NOT manage the upload queue.
   */
  private simulateProcessing(uploadFile: UploadFile): void {
    // Clear any existing timeout just in case
    if (uploadFile.processingTimeoutId) {
      clearTimeout(uploadFile.processingTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      // Only set to COMPLETED if it hasn't been removed/cancelled during processing
      if (uploadFile.status === 'PROCESSING') {
        uploadFile.status = 'COMPLETED';
        console.log(`Processing complete: ${uploadFile.file.name}`);
      }

      uploadFile.processingTimeoutId = undefined;
      // The upload queue management is done elsewhere.
    }, 10000); // 10 seconds

    uploadFile.processingTimeoutId = timeoutId;
  }

  cancelUpload(uploadFile: UploadFile): void {
    const wasUploading = uploadFile.status === 'UPLOADING';

    if (uploadFile.uploadSub) {
      uploadFile.uploadSub.unsubscribe();
    }

    // Cancel the processing timeout if it exists
    if (uploadFile.processingTimeoutId) {
      clearTimeout(uploadFile.processingTimeoutId);
      uploadFile.processingTimeoutId = undefined;
    }

    // If it was uploading, or pending, set it back to PENDING.
    if (wasUploading) {
      uploadFile.status = 'PENDING';

      // If the upload sequence was active, start the next file.
      if (this.isUploading) {
        this.startNextUpload();
      }
    } else if (
      uploadFile.status !== 'COMPLETED' &&
      uploadFile.status !== 'FAILED'
    ) {
      uploadFile.status = 'PENDING';
    }

    uploadFile.progress = 0;
    console.log(`Cancelled: ${uploadFile.file.name}`);
  }

  // Remove a file from the list
  removeFile(fileToRemove: UploadFile): void {
    const wasUploading = fileToRemove.status === 'UPLOADING';

    // Cancel the upload/processing and check if it was part of the active upload process.
    this.cancelUpload(fileToRemove);

    this.selectedFiles = this.selectedFiles.filter((f) => f !== fileToRemove);

    // If the removed file was the one currently uploading, start the next one.
    if (wasUploading && this.isUploading) {
      this.startNextUpload();
    }
  }

  // Clear all files
  clearAll(): void {
    this.selectedFiles.forEach((f) => this.cancelUpload(f));
    this.selectedFiles = [];
    this.isUploading = false;
  }
}
