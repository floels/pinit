export class ResponseKOError extends Error {}
export class Response401Error extends ResponseKOError {}
export class Response404Error extends ResponseKOError {}
export class MalformedResponseError extends Error {}
export class MissingAccessTokenError extends Error {}
