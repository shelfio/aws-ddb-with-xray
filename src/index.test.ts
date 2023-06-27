jest.mock('aws-xray-sdk-core');

import {captureAWSv3Client} from 'aws-xray-sdk-core';
import {GetCommand, PutCommand} from '@aws-sdk/lib-dynamodb';
import {getDocumentClient} from '.';

process.env.AWS_XRAY_DAEMON_ADDRESS = 'localhost:2000';
const ddb = getDocumentClient();

it('should work as a ddb client', async () => {
  const ddbPutCommand = new PutCommand({
    TableName: 'example_table',
    Item: {hash_key: 'foo', range_key: 'bar', some: 'key'},
  });
  const ddbGetCommand = new GetCommand({
    TableName: 'example_table',
    Key: {hash_key: 'foo', range_key: 'bar'},
  });

  await ddb.send(ddbPutCommand);

  const {Item} = await ddb.send(ddbGetCommand);

  expect(Item).toEqual({hash_key: 'foo', range_key: 'bar', some: 'key'});
  expect(captureAWSv3Client).toHaveBeenCalledWith(ddb);
});
