import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Quagga from 'quagga';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css']
})
export class ScannerComponent implements OnInit {
  barcode:string = '';
  scanning:boolean = false;
  configQuagga = {
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: '#inputBarcode',
      constraints: {
        width: { min: 640 },
        height: { min: 480 },
        aspectRatio: { min: 1, max: 100 },
        facingMode: 'environment', // or user
      },
      singleChannel: false // true: only the red color-channel is read
    },
    locator: {
      patchSize: 'medium',
      halfSample: true
    },
    locate: true,
    numOfWorkers: 4,
    decoder: {
      readers: ['code_128_reader']
    }
  };
  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    console.log('Barcode: initialization');
  }

  // testChangeValues() {
  //   this.barcode = 'Code-barres bidon : 0123456789';
  // }

  startScanner() {
    this.scanning = true;
    this.barcode = '';
    this.ref.detectChanges();

    Quagga.onProcessed((result) => this.onProcessed(result));

    Quagga.onDetected((result) => this.logCode(result));

    Quagga.init(this.configQuagga, (err) => {
      if (err) {
        return console.log(err);
      }
      Quagga.start();
      console.log('Barcode: initialization finished. Ready to start');
    });
  }

  private onProcessed(result: any) {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;
    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width'), 10), parseInt(drawingCanvas.getAttribute('height'), 10));
        result.boxes.filter(function (box) {
          return box !== result.box;
        }).forEach(function (box) {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }
    }
  }

  private logCode(result) {
    const code = result.codeResult.code;
    if(this.barcode != code) {
      this.barcode = code;
      this.ref.detectChanges();
      this.scanning = false;
      Quagga.stop();
    }
  }
}
