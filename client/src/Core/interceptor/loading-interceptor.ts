import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { BusyService } from '../services/busy-service';
import { delay, finalize, identity, of, tap } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';

const cache = new Map<string, HttpEvent<unknown>>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService = inject(BusyService)

  if(req.method === 'GET'){
    const cachedResponse = cache.get(req.url);
    if(cachedResponse){
      return of(cachedResponse)
    }
  }
  busyService.busy();
  
  return next(req).pipe(
    (environment.production ? identity : delay(500)),
    tap(response => {
      cache.set(req.url, response)
    }),
    finalize(() => {
      busyService.idle();
    }) 
  );
};
