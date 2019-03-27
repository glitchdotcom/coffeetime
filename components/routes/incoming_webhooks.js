const debug = require('debug')('botkit:incoming_webhooks');
const express = require('express');
const router = express.Router();

function onSlackRecieve(req, res) {

  // NOTE: we should enforce the token check here

  // respond to Slack that the webhook has been received.
  res.status(200);

  console.log('~~~~~~~~~ slack receive ~~~~~~~~~');
  const routeParams = req.params;
  console.log(routeParams);
  console.log('~~~~~~~~~ * ~~~~~~~~~')

  // Now, pass the webhook into be processed.
  req.controller.handleWebhookPayload(req, res);
}

debug('Configured /slack/receive url');
router.post('/slack/receive', onSlackRecieve);

module.exports = router;

