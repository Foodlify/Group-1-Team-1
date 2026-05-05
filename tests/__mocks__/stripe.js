// Manual mock for the 'stripe' npm package (not installed in test environment)
const Stripe = jest.fn().mockImplementation(() => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue({ id: 'pi_mock', client_secret: 'secret_mock' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'pi_mock', status: 'succeeded' }),
    confirm: jest.fn().mockResolvedValue({ id: 'pi_mock', status: 'succeeded' }),
  },
}));

module.exports = Stripe;
module.exports.default = Stripe;
