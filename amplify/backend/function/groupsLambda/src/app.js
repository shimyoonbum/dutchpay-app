const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const bodyParser = require('body-parser')
const express = require('express')
const uuidv1 = require("uuid").v1

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

let tableName = "groups";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + '-' + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "guid";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/groups";
const UNAUTH = 'UNAUTH';
const hashKeyPath = '/:' + partitionKeyName;
const sortKeyPath = hasSortKey ? '/:' + sortKeyName : '';

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + hashKeyPath, async function(req, res) {
  const condition = {}
  condition[partitionKeyName] = {
    ComparisonOperator: 'EQ'
  }

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  } else {
    try {
      condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
    } catch(err) {
      res.statusCode = 500;
      res.json({error: 'Wrong column type ' + err});
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
});

/*****************************************
 * HTTP Get method for get single object -- 그룹 정보 읽기 API *
 *****************************************/
app.get(path + hashKeyPath, async function (req, res) {
  let queryParams = {
    TableName: tableName,
    Key: { [partitionKeyName]: req.params[partitionKeyName] },
  }

  try {
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    res.json(data.Items);
  } catch (err) {
    res.statusCode = 500;
    res.json({error: 'Could not load items: ' + err.message});
  }
})
/************************************
 * HTTP put method for adding an expense to the group - 비용 추가 API *
 *************************************/
app.put(`${path}${hashKeyPath}/expenses`, async function (req, res) {
  const guid = req.params[partitionKeyName]
  const { expense } = req.body

  if (
    expense === null ||
    expense === undefined ||
    !expense.payer ||
    !expense.amount
  ) {
    res.statusCode = 400
    res.json({ error: "Invalid expense object" })
    return
  }

  let updateItemParams = {
    TableName: tableName,
    Key: {
      [partitionKeyName]: guid,
    },
    UpdateExpression:
      "SET expenses = list_append(if_not_exists(expenses, :empty_list), :vals)",
    ExpressionAttributeValues: {
      ":vals": [expense],
      ":empty_list": [],
    },
  }

  try {
    let data = await ddbDocClient.send(new UpdateCommand(updateItemParams));
    res.json({ data: data })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
})
/************************************
 * HTTP put method for adding members to the group - 멤버 추가 API *
 *************************************/
app.put(`${path}${hashKeyPath}/members`, async function (req, res) {
  const guid = req.params[partitionKeyName]
  const { members } = req.body

  if (
    members === null ||
    members === undefined ||
    !Array.isArray(members) ||
    members.length === 0
  ) {
    res.statusCode = 400
    res.json({
      error: "invalid members",
    })
    return
  }

  let putItemParams = {
    TableName: tableName,
    Key: {
      [partitionKeyName]: guid,
    },
    UpdateExpression: "SET members = :members",
    ExpressionAttributeValues: {
      ":members": members,
    },
  }

  try {
    let data = await ddbDocClient.send(new UpdateCommand(putItemParams));
    res.json({ data: data })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});
/************************************
 * HTTP post method for creating a group - 그룹 생성 API *
 *************************************/

app.post(path, async function(req, res) {
  const { groupName } = req.body
  const guid = uuidv1()

  if (
    groupName === null ||
    groupName === undefined ||
    groupName.trim().length === 0
  ) {
    res.statusCode = 400
    res.json({ error: "invalid group name" })
    return
  }

  let putItemParams = {
    TableName: tableName,
    Item: {
      groupName: groupName,
      guid: guid,
    },
  }
  try {
    let data = await ddbDocClient.send(new PutCommand(putItemParams));
    res.json({ data: {guid : guid} })
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: err, url: req.url, body: req.body });
  }
});

app.listen(3000, function() {
  console.log("App started")
});

module.exports = app