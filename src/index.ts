import {captureAWSv3Client} from 'aws-xray-sdk-core';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';

const isTest = process.env.JEST_WORKER_ID;
const endpoint = process.env.DYNAMODB_ENDPOINT;
const region = process.env.REGION;

export type Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};
const getDDBClient = (credentials?: Credentials) =>
  new DynamoDBClient({
    ...(isTest && {
      endpoint: endpoint ?? 'http://localhost:8000',
      tls: false,
      region: region ?? 'local-env',
    }),
    credentials: getCredentials(credentials),
  });

const getCredentials = (credentials?: Credentials) => {
  if (credentials && Object.keys(credentials).length) {
    return credentials;
  }

  return {
    accessKeyId: 'fakeMyKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  };
};

export function getDocumentClient(credentials?: Credentials): DynamoDBClient {
  const ddbDocumentClient = DynamoDBDocumentClient.from(getDDBClient(credentials));

  if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
    captureAWSv3Client(ddbDocumentClient);
  }

  return ddbDocumentClient;
}
