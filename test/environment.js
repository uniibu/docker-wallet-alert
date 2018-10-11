const tape = require('tape');
const walert = require('../');
tape.onFailure(() => {
  process.exit(1);
});

tape('environment', t => {
  t.plan(1);
  walert().catch(function(err){
    t.equal(err.message, 'Missing environment variables');
  });  
});