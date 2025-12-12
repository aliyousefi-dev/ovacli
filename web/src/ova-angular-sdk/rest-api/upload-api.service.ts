import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OVASDKConfig } from '../global-config';

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);

  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest(
      'POST',
      `${this.config.apiBaseUrl}/upload`,
      formData,
      {
        withCredentials: true,
        reportProgress: true,
      }
    );

    return this.http.request(req);
  }
}
