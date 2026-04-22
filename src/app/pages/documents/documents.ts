import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppDocument, DocumentCategory } from '../../models/document.model';
import { DocumentService } from '../../services/document.service';
import { RoleService } from '../../services/role.service';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './documents.html',
  styleUrls: ['./documents.scss']
})
export class DocumentsComponent {
  private documentService = inject(DocumentService);
  public roleService = inject(RoleService);
  public translate = inject(TranslateService);

  documents: AppDocument[] = [];

  title = '';
  category: DocumentCategory = 'garda-vetting';
  imageBase64: string | null = null;

  currentUser = 'samuel';

  constructor() {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documents = this.documentService.getAll();
  }

  get employeeUploads(): AppDocument[] {
    return this.documents.filter(d => d.category === 'garda-vetting');
  }

  get employerDocuments(): AppDocument[] {
    return this.documents.filter(d => d.category !== 'garda-vetting');
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  upload(): void {
    if (!this.imageBase64) {
      alert(this.translate.t('please_choose_image_first'));
      return;
    }

    const uploadedBy = this.roleService.isAdmin() ? 'admin' : this.currentUser;

    const doc: AppDocument = {
      id: crypto.randomUUID(),
      title: this.title.trim() || this.translate.t('untitled_document'),
      imageUrl: this.imageBase64,
      category: this.category,
      uploadedBy,
      createdAt: new Date().toISOString()
    };

    this.documentService.save(doc);

    this.title = '';
    this.imageBase64 = null;
    this.category = this.roleService.isAdmin() ? 'health-safety' : 'garda-vetting';

    this.loadDocuments();
  }
}