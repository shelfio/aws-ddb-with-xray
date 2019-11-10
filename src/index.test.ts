import {getDocumentClient} from '.';

const ddb = getDocumentClient({
  ddbClientParams: {
    convertEmptyValues: true,
    endpoint: 'localhost:8000',
    sslEnabled: false,
    region: 'local-env'
  },
  ddbParams: {endpoint: 'localhost:8000', sslEnabled: false, region: 'local-env'}
});

it('should work as a ddb client', async () => {
  await ddb
    .put({
      TableName: 'example_table',
      Item: {hash_key: 'foo', range_key: 'bar', some: 'key'}
    })
    .promise();

  const {Item} = await ddb
    .get({
      TableName: 'example_table',
      Key: {hash_key: 'foo', range_key: 'bar'}
    })
    .promise();

  expect(Item).toEqual({hash_key: 'foo', range_key: 'bar', some: 'key'});
});
