import { Injectable } from '@angular/core';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { EventParamsMap } from './types';

@Injectable({
  providedIn: 'root',
})
export class TaggingService {
  constructor(
    // For tracking events we're using Google Analytic today, but tomorrow we could be using something else
    private gtmService: GoogleAnalyticsService
  ) {}

  public tag<Event extends keyof EventParamsMap>(
    event: Event,
    // This typing enforces that the correct params are passed when the event requires them
    ...params: EventParamsMap[Event] extends undefined
      ? []
      : [EventParamsMap[Event]]
  ): void {
    const [eventParam] = params;
    this.gtmService.gtag('event', event, eventParam);
  }
}
