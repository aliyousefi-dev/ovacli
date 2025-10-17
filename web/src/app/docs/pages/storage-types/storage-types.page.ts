import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-database',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './storage-types.page.html',
})
export class DocStorageTypesPage {
  JsonDBType = `{
  "storagetype": "jsondb"
}`;
  BoltDBType = `{
  "storagetype": "boltdb"
}`;
}
