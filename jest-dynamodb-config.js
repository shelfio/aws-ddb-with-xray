module.exports = {
  tables: [
    {
      TableName: `example_table`,
      KeySchema: [
        {AttributeName: 'hash_key', KeyType: 'HASH'},
        {AttributeName: 'range_key', KeyType: 'RANGE'}
      ],
      AttributeDefinitions: [
        {AttributeName: 'hash_key', AttributeType: 'S'},
        {AttributeName: 'range_key', AttributeType: 'S'}
      ],
      ProvisionedThroughput: {ReadCapacityUnits: 1, WriteCapacityUnits: 1}
    }
  ]
};
