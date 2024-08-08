import { Injectable } from '@angular/core';
import { HttpStatusCodes } from '../enums/http-status-codes.enum'


@Injectable({
    providedIn: 'root'
  })
  export class ErrorHandlerService {
    handleError(error: { status: HttpStatusCodes }): string {
      switch (error.status) {
        case HttpStatusCodes.BAD_REQUEST:
          return 'Bad Request';
        case HttpStatusCodes.UNAUTHORIZED:
          return 'Unauthorized';
        case HttpStatusCodes.FORBIDDEN:
          return 'Forbidden';
        case HttpStatusCodes.NOT_FOUND:
          return 'Not Found';
        case HttpStatusCodes.INTERNAL_SERVER_ERROR:
          return 'Internal Server Error';
        case HttpStatusCodes.SERVICE_UNAVAILABLE:
          return 'Service Unavailable';
        default:
          return 'Unknown error';
      }
    }
  }

  