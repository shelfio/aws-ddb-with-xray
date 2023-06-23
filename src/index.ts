import AWSXRay from 'aws-xray-sdk-core';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import type {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

type GetDocumentClientParams = {
  ddbParams: DynamoDB.Types.ClientConfiguration;
  ddbClientParams: DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };
};

export function getDocumentClient(params: GetDocumentClientParams): DocumentClient {
  const config = {
    ...params.ddbClientParams,
    credentials: params?.credentials,
    service: new DynamoDB({...params.ddbParams, credentials: params.credentials}),
  };

  const ddbDocumentClient = new DynamoDB.DocumentClient(config);

  if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
    // @see https://git.io/JeaSG
    // @ts-ignore
    AWSXRay.captureAWSClient(ddbDocumentClient.service);
  }

  return ddbDocumentClient;
}
