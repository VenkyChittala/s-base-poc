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
  constructor(private fileUploadService: FileUploadService, private dialog: MatDialog) {}

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }
// // modify from UI

//   onUpload() {
//     if (this.file) {
//       this.modifyAndExportData(this.file).then((newfile: File) => {
//         this.fileUploadService.uploadFile(newfile).subscribe(
//           response => {
//             console.log('File uploaded successfully:', response);
//             // Handle response from the server
//           },
//           error => {
//             console.error('Error uploading file:', error);
//             // Handle error
//           }
//         );
//       }).catch(error => {
//         console.error('Error modifying and exporting file:', error);
//         // Handle error
//       });
//     }
//   }

// modify from Backend
onUpload() {
  if (this.file) {
    this.fileUploadService.uploadFile(this.file).subscribe(
      (response: any) => {
        console.log('File uploaded successfully:', response);
        // Check if the response contains a 'path' property
        if (response.path) {
          this.dialog.open(InfoDialogComponent, {
            data: { message: 'File uploaded successfully', header: 'Success' },
          });
          // Handle successful response
        } else {
          console.error('Error uploading file:', response);
          // Handle error
        }
      },
      error => {
        console.error('Error uploading file:', error);
        // Handle error
      });
  }
}

  async readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        resolve(data);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsBinaryString(file);
    });
  }


  modifyData(data: any[]): any[] {
    const modifiedData = data.map((row: any[]) => {
      return row.map((cell: any, i) => {
        // Modify cell value here (e.g., add a prefix)
        if (i === 0) {
          return "Modified: " + cell;
        } else {
          return cell;
        }
      });
    });
    return modifiedData;
  }

  exportToExcel(modifiedData: any[], filename: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  
  saveAsExcelFile(buffer: any, filename: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, filename + '.xlsx');
  }

  // Inside your component class
  
  modifyAndExportData1(file: File) {
    this.readFile(file).then((excelData: any[]) => {
      const modifiedData = this.modifyData(excelData);
      this.exportToExcel(modifiedData, 'modified_file');
    });
  } 
  
  async modifyAndExportData(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        // const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const data: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        // Modify data as needed
        // For example, modify the first cell of the first row
        if (data.length > 0 && data[0].length > 0) {
          data[0][0] = "Modified: " + data[0][0];
        }

        // Create a new workbook with the modified data
        const modifiedWorksheet = XLSX.utils.aoa_to_sheet(data);
        const modifiedWorkbook: XLSX.WorkBook = { Sheets: { 'data': modifiedWorksheet }, SheetNames: ['data'] };
        const modifiedBinaryString = XLSX.write(modifiedWorkbook, { bookType: 'xlsx', type: 'binary' });

        // Convert the binary string to a Blob
        const blob = new Blob([this.s2ab(modifiedBinaryString)], { type: 'application/octet-stream' });

        // Create a new File object with the Blob and file name
        const modifiedFile = new File([blob], 'modified_file.xlsx', { type: 'application/octet-stream' });

        resolve(modifiedFile);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  }

  s2ab(s: any): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}
