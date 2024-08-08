import { 
    Component, 
    OnInit, 
    OnDestroy, 
    ChangeDetectorRef, 
    ViewChildren,
    QueryList,
    ElementRef
  } from '@angular/core';
  import { FormControl, FormGroup } from '@angular/forms';
  import { FormService } from '../core/services/form-service';
  import { debounceTime, switchMap, tap, catchError, filter, bufferWhen, takeUntil } from 'rxjs/operators';
  import { of, Subject } from 'rxjs';
  import { HttpStatusCodes } from '../core/enums/http-status-codes.enum';
  import { InputData } from '../core/models/input-data.model';
  import { ErrorHandlerService } from '../core/services/error-handler.service';
  
  @Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
  })
  export class FormComponent implements OnInit, OnDestroy {
    @ViewChildren('updateInfo') updateInfoElements!: QueryList<ElementRef>;

    public form!: FormGroup;
    public errorMessage: string | null = null;

    private formUpdate$ = new Subject<InputData>();
    private destroy$ = new Subject<void>();
  
    constructor( 
      private formService: FormService,
      private cdr: ChangeDetectorRef,
      private errorHandler: ErrorHandlerService,
    ) {
      this.cdr.detach();
    }
  
    ngOnInit() {
      this.initData();
      this.cdr.detectChanges();
    }
  
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }

    private initData(): void {
      this.form = new FormGroup({
        textInput: new FormControl(''),
        radioInput: new FormControl(['option1']),
        checkboxInput: new FormControl(false),
      })
    
      const formUpdateInProgress$ = new Subject<void>();
    
      this.form.valueChanges.pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        tap(value => this.formUpdate$.next(value))
      ).subscribe();
      
    
      this.formUpdate$.pipe(
        takeUntil(this.destroy$),
        tap(() => formUpdateInProgress$.next()),
        bufferWhen(() => formUpdateInProgress$.pipe(
          debounceTime(1000)
        )),
        filter(values => values.length > 0),
        switchMap(values => {
          const lastValue = values[values.length - 1];
          formUpdateInProgress$.next();
          return this.formService.saveData(lastValue).pipe(
            tap(() => {
              this.errorMessage = null;
              formUpdateInProgress$.next();
            }),
            catchError(error => {
              this.handleError(error);
              formUpdateInProgress$.next();
              return of(null);
            })
          );
        })
      ).subscribe(response => {
        if (response) {
          this.form.patchValue(response, { emitEvent: false });
          this.showUpdatedData(response);
          this.cdr.detectChanges();
        }
      });
    }
  
    private handleError(error: { status: HttpStatusCodes }): void {
      this.errorMessage = this.errorHandler.handleError(error);
      this.cdr.detectChanges();
    }
  
    private showUpdatedData<T>(data: T): void {
      this.updateInfoElements.forEach((element: ElementRef) => {
        element.nativeElement.style.display = 'block';
        setTimeout(() => {
          element.nativeElement.style.display = 'none';
        }, 3000);
      });
    }
  }
  