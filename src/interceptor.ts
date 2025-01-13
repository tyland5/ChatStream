import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse} from "@angular/common/http";
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
            // if we get a 401 with from an api other than check credentials, redirect to login. this assumes bc of an expired session. 
            // tampering with csrf token and refreshing page makes auth-guard fail and redirect to login page.  
            // router.url !== home so not logged in user can actually see the home and not be rerouted to login form due to failed 401 attempt to retrieve personal user info
            if (error.status === 401 && !error.url?.endsWith("check-credentials") && router.url !== "/home") {
                localStorage.clear()
                router.navigate(['/login'])
            }
            return throwError(error);
        })
    );
  }