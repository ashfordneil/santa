import { Static } from 'runtypes';
import { RuntypeBase } from 'runtypes/lib/runtype';

const id = <T>(t: T): T => t;

const wrap = (message: string) => (inner: Error): never => {
  const output = new Error(message);
  output.stack = [ inner.message, inner.stack, '-----', output.stack ].join('\n');
  throw output;
};

export const request = async <Req, Resp extends RuntypeBase>(path: string, payload: Req, validator: Resp): Promise<Static<Resp>> => {
  const head = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).then(id, wrap('Unable to contact the server'));

  if (!head.ok) {
    const isString = head.headers.get('content-type') === 'text/plain; charset=UTF-8';
    const text = isString ? await head.text().then(id, () => 'Lost contact with the server') : 'Unexpected response from the server';
    const error = new Error(text);
    error.stack = [
      `Received a status code of ${head.status} (${head.statusText})`,
      `Attempting to POST to ${path}, with payload ${JSON.stringify(payload)}`,
      '-----',
      error.stack
    ].join('\n');
    throw error;
  }

  const rawBody = await head.json().then(id, wrap('Lost contact with the server'));
  const output = validator.validate(rawBody);
  if (output.success) {
    return output.value;
  } else {
    const error = new Error('Invalid response received from the server');
    error.stack = [
      output.message,
      JSON.stringify(output.details)
    ].join('\n');
    throw error;
  }
};