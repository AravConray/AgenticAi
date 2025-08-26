module.exports = async function apiCaller (options) {
  const fetch = require('node-fetch');
  const AbortController = require('abort-controller');

  const baseUrl = process.env.API_BASE_URL || '';

  const {path = '', method = 'GET', headers = {}, body = null, timeout = 5000} = options;

  const url = baseUrl + path;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const requestOptions = {
    method,
    headers: {'Content-Type': 'application/json', ...headers},
    signal: controller.signal
  };

  if (body) {
    requestOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
  }

  let response;
  try {
    response = await fetch(url, requestOptions);
  } finally {
    clearTimeout(timer);
  }

  const responseText = await response.text();
  let responseData;

  try {
    responseData = responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    responseData = responseText;
  }

  if (!response.ok) {
    const err = new Error('HTTP error ' + response.status);
    err.status = response.status;
    err.body = responseData;
    throw err;
  }

  return responseData;
};