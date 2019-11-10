# aws-ddb-with-xray [![CircleCI](https://circleci.com/gh/shelfio/aws-ddb-with-xray/tree/master.svg?style=svg)](https://circleci.com/gh/shelfio/aws-ddb-with-xray/tree/master) ![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg) [![npm (scoped)](https://img.shields.io/npm/v/@shelf/aws-ddb-with-xray.svg)](https://www.npmjs.com/package/@shelf/aws-ddb-with-xray)

> Adding X-Ray to DynamoDB Document Client requires a hack (see https://git.io/JeaSG). This package encapsulates that logic

## Install

```
$ yarn add @shelf/aws-ddb-with-xray
```

## Usage

```js
const {getDocumentClient} = require('@shelf/aws-ddb-with-xray');

const ddb = getDocumentClient({
  ddbParams: {region: 'us-east-1', convertEmptyValues: true},
  ddbClientParams: {region: 'us-east-1'}
});

await ddb
  .get({
    TableName: 'foo',
    Key: {hash_key: 'bar'}
  })
  .promise();
```

## License

MIT © [Shelf](https://shelf.io)
