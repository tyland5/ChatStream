import { HttpRequest, HttpHandlerFn, HttpEvent, HttpEventType, HttpErrorResponse} from "@angular/common/http";
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError } from "rxjs";
import { throwError } from "rxjs";

// this intercepts responses and deletes local storage if not logged in 
export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const router = inject(Router)
    
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // if we get a 401 with from an api other than check credentials, redirect to login.
            // this assumes this is from an expired session. tampering with csrf token doesn't make a user considered logged out thus doesnt redirect 
            if (error.status === 401 && !error.url?.endsWith("check-credentials")) {
                //localStorage.clear()
                router.navigate(['/login']); 
            }
            return throwError(error);
        })
    );
  }