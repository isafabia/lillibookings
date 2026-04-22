import { Injectable } from '@angular/core';
import { AppDocument, DocumentCategory } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private key = 'lilliput-documents';

  getAll(): AppDocument[] {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  save(doc: AppDocument): void {
    const docs = this.getAll();
    docs.unshift(doc); // newest first
    localStorage.setItem(this.key, JSON.stringify(docs));
  }
}