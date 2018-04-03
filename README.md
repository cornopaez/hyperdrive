# a Readme for our hyperdrive project

```json
{
 "_id" : ObjectId("5ab96311a10d530004addba3"),
 "source" : "agent",
 "resolvedQuery" : "Hello",
 "speech" : "",
 "action" : "input.welcome",
 "actionIncomplete" : false,
 "parameters" : {
  
 },
 "contexts" : [ ],
 "metadata" : {
  "intentId" : "1f6eacd0-6d06-4883-8473-e7920c9749fe",
  "webhookUsed" : "true",
  "webhookForSlotFillingUsed" : "false",
  "intentName" : "Default Welcome Intent"
 },
 "fulfillment" : {
  "speech" : "Hi! Thank you for contacting the PNC Helpdesk. How may I help you?",
  "messages" : [
   {
    "type" : 0,
    "platform" : "skype",
    "speech" : "Hello to our Skype user. How can I help you?"
   },
   {
    "type" : 0,
    "speech" : "Hello (user.name), how may I help you?"
   }
  ]
 },
 "score" : 1
}
```

A sample call from api.ai

```bash
curl -X POST http://localhost:3000/search -H 'Cache-Control: no-cache' -H 'Content-Type: application/json' -H 'Postman-Token: ca9aed8e-0366-4742-a33e-bf7137f305f4' -d '{"resolvedQuery" : "password"}'
```

a test call to the api

