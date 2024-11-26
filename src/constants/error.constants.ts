import { HTTPException } from 'hono/http-exception';
import { StatusCode as HonoStatusCode } from 'hono/utils/http-status';

export const StatusCode = {
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_AUTHORIZED: 401,
};

export const ErrorMessages = {
  UNHANDLED_ERROR: 'An unhandled error occurred',
  INVALID_PRIVATE_KEY: 'Invalid service account private key',
  NOT_AUTHORIZED: 'Not authorized to access this resource',
  ERROR_PROMPT: 'Error fetching prompt',
};

interface ErrorArgs {
  status?: keyof typeof StatusCode;
  message?: keyof typeof ErrorMessages;
  cause?: unknown;
}
export const throwError = ({
  message = 'UNHANDLED_ERROR',
  status = 'INTERNAL_SERVER_ERROR',
  cause,
}: ErrorArgs) => {
  throw new HTTPException(StatusCode?.[status] as unknown as HonoStatusCode, {
    message: ErrorMessages?.[message],
    cause,
  });
};
