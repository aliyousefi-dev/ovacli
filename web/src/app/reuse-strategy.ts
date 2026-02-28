import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers = new Map<string, DetachedRouteHandle>();
  private scrollPositions = new Map<string, number>();

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['reuse'] === true;
  }

  store(
    route: ActivatedRouteSnapshot,
    handle: DetachedRouteHandle | null,
  ): void {
    if (handle && route.data['reuse'] === true) {
      const key = this.getRouteKey(route);
      this.handlers.set(key, handle);

      const scrollPosition = window.scrollY;
      this.scrollPositions.set(key, scrollPosition);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true && this.handlers.has(key);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getRouteKey(route);
    return route.data['reuse'] === true
      ? (this.handlers.get(key) ?? null)
      : null;
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private getRouteKey(route: ActivatedRouteSnapshot): string {
    return route.routeConfig?.path ?? ''; // Use a string property like 'path', or fallback to empty string
  }

  restoreScrollPosition(route: ActivatedRouteSnapshot): void {
    const key = this.getRouteKey(route);
    const scrollPosition = this.scrollPositions.get(key);
    if (scrollPosition !== undefined) {
      window.scrollTo(0, scrollPosition);
    }
  }
}
