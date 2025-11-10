module.exports = async function(input, sandbox, context) {
  const msg = input && typeof input.message === 'string' ? input.message : 'world';
  return { greeting: `Hello, ${msg}!` };
};
