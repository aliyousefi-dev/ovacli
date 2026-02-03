import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OVASDKConfig } from '../global-config';
import { ApiMap } from './api-map';

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private http = inject(HttpClient);
  private config = inject(OVASDKConfig);
  private apiMap = inject(ApiMap);

  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = this.apiMap.upload.video();

    const req = new HttpRequest('POST', url, formData, {
      withCredentials: true,
      reportProgress: true,
    });

    return this.http.request(req);
  }
}
