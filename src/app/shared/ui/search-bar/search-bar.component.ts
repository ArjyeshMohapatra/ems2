import { Input, Output, Component, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides template standard utilities
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Template dependencies provided directly
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnDestroy {

  ngOnInit(): void {
  }

  @Input() placeholder = 'Search...';
  @Input() debounceDelay = 300;
  @Output() search = new EventEmitter<string>();

  private searchText = new Subject<string>();
  private subscription: Subscription;

  constructor() {
    this.subscription = this.searchText
      .pipe(
        // waits for user to stop typing for debounceDelay seconds
        debounceTime(this.debounceDelay),

        // only search if value actually changed
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.search.emit(value);
      });
  }

  onInput(event: Event): void{
    const value = (event.target as HTMLInputElement).value;
    this.searchText.next(value);
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
  }
}
