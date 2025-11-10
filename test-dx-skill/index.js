module.exports = async function(input, sandbox, context) {
  const msg = (input && input.message) || 'world';
  return { greeting: 'Hello, ' + msg + '!' };
};
