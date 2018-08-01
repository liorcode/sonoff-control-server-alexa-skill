/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 */
import { AlexaRequestsHandler } from './request-handler';
import { AlexaRequest, AlexaResponse } from './models/alexa.types';

type HandlerCallback = (err: Error, resp?: AlexaResponse) => void;

export const handler = (request: AlexaRequest, context: any, callback: HandlerCallback) => {
  const handler = new AlexaRequestsHandler();
  return handler.handleDirective(request.directive)
    .then((resp) => {
      callback(null, resp);
    }).catch((errorMessage) => {
      callback(new Error(errorMessage));
    });
};
