import {captureAWSv3Client} from 'aws-xray-sdk-core';
import type {DynamoDBClientConfig} from '@aws-sdk/client-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import type {TranslateConfig} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';

type GetClientParams = {
  credentials?: Credentials;
  documentClientConfig?: TranslateConfig;
  clientConfig: DynamoDBClientConfig;
  singleton?: boolean;
};

const isTest = process.env.JEST_WORKER_ID;
const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.REGION;
let client: DynamoDBClient;

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
      ...getCredentials(params?.credentials),
    });
  }

  if (client) {
    return client;
  }

  client = new DynamoDBClient({
    ...(isTest && {
      endpoint: endpoint ?? 'http://localhost:8000',
      tls: false,
      region: region ?? 'local-env',
    }),
    ...(params?.clientConfig && params.clientConfig),
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
