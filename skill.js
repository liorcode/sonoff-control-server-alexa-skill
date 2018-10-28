const request = require('request-promise-lite');
// Devices server should be set in environment
const SERVER_URL = process.env.DEVICES_SERVER_URL;
/**
 * Generate a unique message ID
 * @return {string} uuid 4
 */
function generateMessageID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Basic logger. Can be replaced by anything (such as winston)
 * @param {string} level - log level to show in the message
 * @param {*} args - logged message and arguments
 */
function log(level, ...args) {
  console.log(level.toUpperCase(), ...args);
}

/**
 * Generate a response message
 *
 * @param {string} namespace - Directive namespace
 * @param {string} name - Directive name
 * @param {Object} [payload] - Any special payload required for the response
 * @returns {Object} Response object
 */
function generateResponse(namespace, name, payload = {}) {
  return {
    header: {
      messageId: generateMessageID(),
      name,
      namespace,
      payloadVersion: '2',
    },
    payload,
  };
}

function getDevicesFromPartnerCloud(token) {
  return request.get(`${SERVER_URL}/devices/`, {
    json: true,
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((devices) => {
    // convert to Alexa format
    return devices.map(device => ({
      applianceId: device.id,
      modelName: device.model,
      version: device.version,
      manufacturerName: 'Sonoff',
      friendlyName: device.name,
      friendlyDescription: `Sonoff switch: ${device.name}`,
      isReachable: device.isOnline,
      actions: ['turnOn', 'turnOff'],
      additionalApplianceDetails: {}
    }))
  });
}

function isValidToken(token) {
  if (!token) {
    return Promise.reject();
  }

  return request.get(`${SERVER_URL}/users/me`, {
    json: true,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isDeviceOnline(applianceId, token) {
  log('DEBUG', `isDeviceOnline (applianceId: ${applianceId})`);

  /**
   * Always returns true for sample code.
   * You should update this method to your own validation.
   */
  return request.get(`${SERVER_URL}/devices/${applianceId}`, {
    json: true,
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((device) => {
    return device.isOnline;
  });
}

function turnOn(applianceId, token) {
  log('DEBUG', `turnOn (applianceId: ${applianceId})`);

  return request.patch(`${SERVER_URL}/devices/${applianceId}`, {
    json: true,
    body: { state: { switch: 'on' } },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(() => {
    log('INFO', `turned on successfully ${applianceId}`);
    return generateResponse('Alexa.ConnectedHome.Control', 'TurnOnConfirmation');
  }).catch((e) => {
    log('ERROR',`unable to turn on ${applianceId}`, e);
  });
}

function turnOff(applianceId, token) {
  log('DEBUG', `turnOff (applianceId: ${applianceId})`);

  return request.patch(`${SERVER_URL}/devices/${applianceId}`, {
    json: true,
    body: {
      state: { switch: 'off' } },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(() => {
    log('INFO', `turned off successfully ${applianceId}`);
    return generateResponse('Alexa.ConnectedHome.Control', 'TurnOffConfirmation');
  }).catch((e) => {
    log('ERROR',`unable to turn off ${applianceId}`, e);
  });
}

/**
 * Main logic
 */

/**
 * This function is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given customer.
 *
 * @param {Object} request - The full request object from the Alexa smart home service. This represents a DiscoverAppliancesRequest.
 *     https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesrequest
 */
function handleDiscovery(request) {
  log('DEBUG', `Discovery Request: ${JSON.stringify(request)}`);

  /**
   * Get the OAuth token from the request.
   */
  const userAccessToken = request.payload.accessToken.trim();

  return isValidToken(userAccessToken)
    .then(() => getDevicesFromPartnerCloud(userAccessToken))
    .then((devices) => {
      const response = generateResponse('Alexa.ConnectedHome.Discovery', 'DiscoverAppliancesResponse', {
        discoveredAppliances: devices
      });

      /**
       * log the response. These messages will be stored in CloudWatch.
       */
      log('DEBUG', `Discovery Response: ${JSON.stringify(response)}`);

      return response;
    }).catch((e) => {
      const errorMessage = `Discovery Request [${request.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
      log('ERROR',errorMessage, e);
      return errorMessage;
    });
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 */
function handleControl(request) {
  log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

  /**
   * Get the OAuth token from the request.
   */
  const userAccessToken = request.payload.accessToken.trim();

  return isValidToken(userAccessToken).then(() => {
    /**
     * Grab the applianceId from the request.
     */
    const applianceId = request.payload.appliance.applianceId;

    /**
     * If the applianceId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!applianceId) {
      log('ERROR', 'No applianceId provided in request');
      const payload = { faultingParameter: `applianceId: ${applianceId}` };
      return Promise.resolve(generateResponse(
        'Alexa.ConnectedHome.Control',
        'UnexpectedInformationReceivedError',
        payload
      ));
    }

    /**
     * At this point the applianceId and accessToken are present in the request.
     *
     * Please review the full list of errors in the link below for different states that can be reported.
     * If these apply to your device/cloud infrastructure, please add the checks and respond with
     * accurate error messages. This will give the user the best experience and help diagnose issues with
     * their devices, accounts, and environment
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#error-messages
     */
    return isDeviceOnline(applianceId, userAccessToken).then((status) => {
      if (!status) {
        log('ERROR', `Device offline: ${applianceId}`);
        return Promise.resolve(generateResponse(
          'Alexa.ConnectedHome.Control',
          'TargetOfflineError'));
      }

      // Device is online
      switch (request.header.name) {
        case 'TurnOnRequest':
          return turnOn(applianceId, userAccessToken);

        case 'TurnOffRequest':
          return turnOff(applianceId, userAccessToken);

        default: {
          log('ERROR', `Unsupported directive name: ${request.header.name}`);
          return Promise.resolve(generateResponse(
            'Alexa.ConnectedHome.Control',
            'UnsupportedOperationError'));
        }
      }
    });
  }).catch((e) => {
    const errorMessage = `Control Failed. Request [${request.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
    log('ERROR', errorMessage, e);
    return errorMessage;
  });
}

/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 * It is recommended to validate the request and response with Alexa Smart Home Skill API Validation package.
 *  https://github.com/alexa/alexa-smarthome-validation
 */
exports.handler = (request, context, callback) => {
  let response;
  switch (request.header.namespace) {
    /**
     * The namespace of 'Alexa.ConnectedHome.Discovery' indicates a request is being made to the Lambda for
     * discovering all appliances associated with the customer's appliance cloud account.
     *
     * For more information on device discovery, please see
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discovery-messages
     */
    case 'Alexa.ConnectedHome.Discovery':
      response = handleDiscovery(request);
      break;

    /**
     * The namespace of "Alexa.ConnectedHome.Control" indicates a request is being made to control devices such as
     * a dimmable or non-dimmable bulb. The full list of Control events sent to your lambda are described below.
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
     */
    case 'Alexa.ConnectedHome.Control':
      response = handleControl(request);
      break;

    /**
     * Received an unexpected message
     */
    default: {
      const errorMessage = `Unsupported namespace: ${request.header.namespace}`;
      log('ERROR', errorMessage);
      response = Promise.reject(errorMessage);
    }
  }

  response.then((resp) => {
    callback(null, resp);
  }).catch((errorMessage) => {
    callback(new Error(errorMessage));
  });
};
