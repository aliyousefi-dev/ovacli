import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      withCredentials: true,
      reportProgress: true,
    });

    return this.http.request(req);
  }
}
