import AWSXRay from 'aws-xray-sdk-core';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';

interface GetDocumentClientParams {
  ddbParams: DynamoDB.Types.ClientConfiguration;
  ddbClientParams: DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration;
}

export function getDocumentClient(params: GetDocumentClientParams): DocumentClient {
  const config = {
    ...params.ddbClientParams,
    service: new DynamoDB(params.ddbParams),
  };

  const ddbDocumentClient = new DynamoDB.DocumentClient(config);

  if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
    // @see https://git.io/JeaSG
    AWSXRay.captureAWSClient((ddbDocumentClient as any).service);
  }

  return ddbDocumentClient;
}
