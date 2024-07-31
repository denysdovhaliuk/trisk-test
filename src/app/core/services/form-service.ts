import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { HttpStatusCodes } from '../enums/http-status-codes.enum';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  saveData(data: any): Observable<any> {
    return of(data).pipe(
      delay(1000),
      switchMap(() => {
        if (this.shouldThrowError()) {
          const randomStatusCode = this.getRandomStatusCode();
          return throwError({ status: randomStatusCode });
        }
        return of(data);
      })
    );
  }

  private shouldThrowError(): boolean {
    return Math.random() < 0.3; // error probability - 30%
  }

  private getRandomStatusCode(): HttpStatusCodes {
    const statusCodes = [
      HttpStatusCodes.BAD_REQUEST,
      HttpStatusCodes.UNAUTHORIZED,
      HttpStatusCodes.FORBIDDEN,
      HttpStatusCodes.NOT_FOUND,
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      HttpStatusCodes.SERVICE_UNAVAILABLE
    ];
    const randomIndex = Math.floor(Math.random() * statusCodes.length);
    return statusCodes[randomIndex];
  }
}
