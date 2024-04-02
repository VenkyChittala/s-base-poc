import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileUploadService } from './file-upload.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 's-base-poc';
  file: File | null = null;
  exceldata: any[] = []
  constructor(private fileUploadService: FileUploadService, public dialog: MatDialog) {}

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }
  onUpload() {
    if (this.file) {
      this.fileUploadService.uploadFile(this.file).subscribe(
        response => {
          console.log('File uploaded successfully:', response);
          // Handle response from the server
        },
        error => {
          console.error('Error uploading file:', error);
          // Handle error
        }
      );
    } else {
        const dialogRef = this.dialog.open(InfoDialogComponent);
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
    }
  }

}
