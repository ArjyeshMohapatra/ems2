import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  ViewChild,
  AfterContentInit,
  ChangeDetectorRef,
  ElementRef,
  Renderer2,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatColumnDef, MatTable, MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule
  ], // Template dependencies provided directly
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements AfterContentInit, OnChanges, OnDestroy {

  @Input() dataSource = new MatTableDataSource<any>([]);
  @Input() displayedColumns: string[] = [];
  @Input() totalRecords = 0;
  @Input() pageSize = 5;
  @Input() pageSizeOptions = [5, 10, 15];
  @Input() defaultColumnWidths: { [key: string]: number } = {};
  @Input() columnStorageKey = '';
  @Input() defaultColumnWidth = 160;
  @Input() minColumnWidth = 80;
  @Input() resizableColumns = true;

  columnsReady = false;
  columnWidths: { [key: string]: number } = {};

  // emits paginator event to parent
  @Output() pageChange = new EventEmitter<any>();

  // get element/component from own's html
  @ViewChild(MatTable, { static: true }) table!: MatTable<any>;

  // finds and collects all projected matColumnDefs from parents
  @ContentChildren(MatColumnDef, { descendants: true }) columns!: QueryList<MatColumnDef>;

  private currentColumn = '';
  private startX = 0;
  private startWidth = 0;
  private moveListener?: () => void;
  private upListener?: () => void;
  private handleListeners: Array<() => void> = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['displayedColumns'] ||
      changes['defaultColumnWidths'] ||
      changes['columnStorageKey'] ||
      changes['defaultColumnWidth']
    ) {
      this.syncColumnWidths();
    }
  }

  ngAfterContentInit(): void {
    if (!this.table) return;

    this.syncColumnWidths();

    this.columns.forEach(column => {
      this.table.addColumnDef(column);
    });

    this.columnsReady = true;
    this.cdr.detectChanges();
    this.addResizeHandles();
  }

  ngOnDestroy(): void {
    this.removeDocumentListeners();
    this.handleListeners.forEach(unlisten => unlisten());
  }

  getColumnWidth(column: string): number {
    return this.columnWidths[column] ||
      this.defaultColumnWidths[column] ||
      this.defaultColumnWidth;
  }

  private startResize(event: MouseEvent, column: string): void {
    if (!this.resizableColumns) return;

    event.preventDefault();
    event.stopPropagation();

    this.currentColumn = column;
    this.startX = event.pageX;
    this.startWidth = this.getColumnWidth(column);

    this.removeDocumentListeners();
    this.moveListener = this.renderer.listen('document', 'mousemove', this.resizeColumn);
    this.upListener = this.renderer.listen('document', 'mouseup', this.stopResize);
  }

  private resizeColumn = (event: MouseEvent): void => {
    if (!this.currentColumn) return;
    // 470 - 400 = 70 px
    const diff = event.pageX - this.startX;
    // max(180,180+70)
    const newWidth = Math.max(this.minColumnWidth, this.startWidth + diff);

    this.columnWidths = {
      ...this.columnWidths,
      [this.currentColumn]: newWidth
    };

    this.cdr.detectChanges();
  };

  private stopResize = (): void => {
    this.saveColumnWidths();
    this.removeDocumentListeners();
    this.currentColumn = '';
  };

  private syncColumnWidths(): void {
    const savedWidths = this.readSavedColumnWidths();
    const nextWidths: { [key: string]: number } = {};

    this.displayedColumns.forEach(column => {
      nextWidths[column] =
        savedWidths[column] ||
        this.columnWidths[column] ||
        this.defaultColumnWidths[column] ||
        this.defaultColumnWidth;
    });

    this.columnWidths = nextWidths;
  }

  private addResizeHandles(): void {
    if (!this.resizableColumns) return;

    const headerCells = this.host.nativeElement.querySelectorAll(
      'th.mat-header-cell, th.mat-mdc-header-cell'
    );

    headerCells.forEach(cell => {
      const column = this.getColumnName(cell as HTMLElement);
      if (!column || this.hasResizeHandle(cell as HTMLElement)) return;

      const handle = this.renderer.createElement('span');

      this.renderer.addClass(handle, 'table-resize-handle');
      this.renderer.setStyle(cell, 'position', 'relative');
      this.renderer.setStyle(handle, 'position', 'absolute');
      this.renderer.setStyle(handle, 'top', '0');
      this.renderer.setStyle(handle, 'right', '0');
      this.renderer.setStyle(handle, 'width', '6px');
      this.renderer.setStyle(handle, 'height', '100%');
      this.renderer.setStyle(handle, 'cursor', 'col-resize');
      this.renderer.setStyle(handle, 'user-select', 'none');

      this.renderer.appendChild(cell, handle);

      const unlisten = this.renderer.listen(handle, 'mousedown', (event: MouseEvent) => {
        this.startResize(event, column);
      });

      this.handleListeners.push(unlisten);
    });
  }

  private hasResizeHandle(cell: HTMLElement): boolean {
    return Array.from(cell.children).some(child => {
      return child.classList.contains('table-resize-handle');
    });
  }

  private getColumnName(cell: HTMLElement): string {
    const columnClass = Array.from(cell.classList).find(className => {
      return className.startsWith('mat-column-');
    });

    return columnClass ? columnClass.replace('mat-column-', '') : '';
  }

  private getStorageKey(): string {
    if (this.columnStorageKey) return this.columnStorageKey;
    if (!this.displayedColumns.length) return '';

    return `tableColumnWidths:${this.displayedColumns.join(',')}`;
  }

  private readSavedColumnWidths(): { [key: string]: number } {
    const storageKey = this.getStorageKey();
    if (!storageKey) return {};

    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private saveColumnWidths(): void {
    const storageKey = this.getStorageKey();
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(this.columnWidths));
  }

  private removeDocumentListeners(): void {
    if (this.moveListener) this.moveListener();
    if (this.upListener) this.upListener();

    this.moveListener = undefined;
    this.upListener = undefined;
  }

}
