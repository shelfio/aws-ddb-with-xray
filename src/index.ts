/* eslint-disable complexity */
import type {DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import type {TranslateConfig} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';
import {captureAWSv3Client} from 'aws-xray-sdk-core';

type GetClientParams = {
  credentials?: Credentials;
  documentClientConfig?: TranslateConfig;
  clientConfig: DynamoDBClientConfig;
  singleton?: boolean;
  forceNew?: boolean;
  marker?: string; // label for the client, use for multi account setup
};

const isTest = process.env.JEST_WORKER_ID;
const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.REGION;
const clientsStore: {[key: string]: DynamoDBClient} = {};
const DEFAULT_MARKER = 'default';

export type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};
const getDDBClient = (params?: GetClientParams) => {
  if (!params?.singleton) {
    return new DynamoDBClient({
      ...(isTest && {
        endpoint: endpoint ?? 'http://localhost:8000',
        tls: false,
        region: region ?? 'local-env',
      }),
      ...(params?.clientConfig && params.clientConfig),
      ...(process.env.FORCE_REGION && {region: process.env.FORCE_REGION}),
      ...getCredentials(params?.credentials),
    });
  }

  const marker = params.marker || DEFAULT_MARKER;
  let client = clientsStore[marker];
  const forceNew = params?.forceNew || false;

  if (client && !forceNew) {
    return client;
  }

  if (client instanceof DynamoDBClient) {
    client.destroy();
  }

  client = new DynamoDBClient({
    ...(isTest && {
      endpoint: endpoint ?? 'http://localhost:8000',
      tls: false,
      region: region ?? 'local-env',
    }),
    ...(params?.clientConfig && params.clientConfig),
    ...(process.env.FORCE_REGION && {region: process.env.FORCE_REGION}),
    ...getCredentials(params?.credentials),
  });

  return client;
};

const getCredentials = (credentials?: Credentials) => {
  if (credentials && Object.keys(credentials).length) {
    return {credentials};
  }

  if (isTest) {
    return {
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey',
      },
    };
  }

  return {};
};

export function getDocumentClient(params?: GetClientParams): DynamoDBClient {
  const ddbDocumentClient = DynamoDBDocumentClient.from(
    getDDBClient(params),
    params?.documentClientConfig
  );

  if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
    captureAWSv3Client(ddbDocumentClient);
  }

  return ddbDocumentClient;
}

export function destroyClient(marker = DEFAULT_MARKER): void {
  if (clientsStore[marker] instanceof DynamoDBClient) {
    clientsStore[marker].destroy();
  }
}
