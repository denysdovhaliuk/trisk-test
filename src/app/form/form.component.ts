import { 
    Component, 
    OnInit, 
    OnDestroy, 
    OnChanges, 
    AfterViewInit, 
    ChangeDetectorRef, 
    ChangeDetectionStrategy, 
    SimpleChanges 
  } from '@angular/core';
  import { FormBuilder, FormGroup } from '@angular/forms';
  import { FormService } from '../core/services/form-service';
  import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
  import { of, Subject, Subscription } from 'rxjs';
  import { HttpStatusCodes } from '../core/enums/http-status-codes.enum';
  
  @Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class FormComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    form!: FormGroup;
    private formUpdate$ = new Subject<any>();
    private subscriptions: Subscription[] = [];
    errorMessage: string | null = null;
  
    constructor(
      private fb: FormBuilder, 
      private formService: FormService,
      private cdr: ChangeDetectorRef
    ) {
      this.cdr.detach();
    }
  
    ngOnInit() {
      this.form = this.fb.group({
        textInput: [''],
        radioInput: ['option1'],
        checkboxInput: [false]
      });
  
      const formChangesSubscription = this.form.valueChanges.pipe(
        debounceTime(500),
        tap(value => this.formUpdate$.next(value))
      ).subscribe();
  
      this.subscriptions.push(formChangesSubscription);
  
      const formUpdateSubscription = this.formUpdate$.pipe(
        switchMap(value => this.formService.saveData(value).pipe(
          tap(() => this.errorMessage = null),
          catchError(error => {
            this.handleError(error);
            return of(null);
          })
        ))
      ).subscribe(response => {
        if (response) {
          this.form.patchValue(response, { emitEvent: false });
          this.showUpdatedData(response);
          this.cdr.detectChanges();
        }
      });
  
      this.subscriptions.push(formUpdateSubscription);
      this.cdr.detectChanges();
    }
  
    ngOnDestroy() {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  
    ngOnChanges(changes: SimpleChanges) {}
  
    ngAfterViewInit() {}
  
    private handleError(error: any) {
      switch (error.status) {
        case HttpStatusCodes.BAD_REQUEST:
          this.errorMessage = 'Bad Request';
          break;
        case HttpStatusCodes.UNAUTHORIZED:
          this.errorMessage = 'Unauthorized';
          break;
        case HttpStatusCodes.FORBIDDEN:
          this.errorMessage = 'Forbidden';
          break;
        case HttpStatusCodes.NOT_FOUND:
          this.errorMessage = 'Not Found';
          break;
        case HttpStatusCodes.INTERNAL_SERVER_ERROR:
          this.errorMessage = 'Internal Server Error';
          break;
        case HttpStatusCodes.SERVICE_UNAVAILABLE:
          this.errorMessage = 'Service Unavailable';
          break;
        default:
          this.errorMessage = 'Unknown error';
      }
      this.cdr.detectChanges();
    }
  
    private showUpdatedData(data: any) {
      const elements = document.querySelectorAll('.update-info');
      (elements as NodeListOf<HTMLElement>).forEach((element: HTMLElement) => {
        element.style.display = 'block';
        setTimeout(() => {
          element.style.display = 'none';
        }, 3000);
      });
    }
  }
  