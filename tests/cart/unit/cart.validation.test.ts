import {
  validateDeleteCartItem,
  validateUpdateQuantity,
} from '../../../src/modules/cartManagement/cart.validation';

describe('CartValidation', () => {
  describe('updateQuantity', () => {
    it('should validate customerId,itemId,ItemQuantity successfully', () => {
      const body = {
        customerId: 1,
        itemId: 1,
        itemQuantity: 2,
      };
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: {
          customerId: 1,
          itemId: 1,
          itemQuantity: 2,
        },
        errors: [],
      });
    });
    it('should return errors array of body error', () => {
      const body = null;
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'Request Body',
            message: 'Request Body is required',
          },
        ],
      });
    });
    it('should return errors array of customerId,itemId,quantity errors', () => {
      const body = {};
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId is required',
          },
          {
            field: 'itemId',
            message: 'itemId is required',
          },
          {
            field: 'quantity',
            message: 'quantity is required',
          },
        ],
      });
    });
    it('should return errors array of customerId, itemId, quantity must be positive number errors', () => {
      const body = {
        customerId: '1',
        itemId: '1',
        itemQuantity: '1',
      };
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId must be a positive integer',
          },
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
          {
            field: 'quantity',
            message: 'quantity must be a positive integer',
          },
        ],
      });
    });
    it('should return errors array of customerId, itemId, quantity must be positive number errors', () => {
      const body = {
        customerId: -2,
        itemId: -1,
        itemQuantity: 0,
      };
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId must be a positive integer',
          },
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
          {
            field: 'quantity',
            message: 'quantity must be a positive integer',
          },
        ],
      });
    });
    it('should return errors array of itemId, quantity must be positive number errors', () => {
      const body = {
        customerId: 1,
        itemId: -1,
        itemQuantity: 0,
      };
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
          {
            field: 'quantity',
            message: 'quantity must be a positive integer',
          },
        ],
      });
    });
    it('should return errors array of  quantity must be positive number errors', () => {
      const body = {
        customerId: 1,
        itemId: 1,
        itemQuantity: 0,
      };
      const result = validateUpdateQuantity(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'quantity',
            message: 'quantity must be a positive integer',
          },
        ],
      });
    });
  });

  describe('deleteItem', () => {
    it('should validate customerId,itemId successfully', () => {
      const body = {
        customerId: 1,
        itemId: 1,
      };
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: {
          customerId: 1,
          itemId: 1,
        },
        errors: [],
      });
    });
    it('should return errors array of body error', () => {
      const body = null;
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'Request Body',
            message: 'Request Body is required',
          },
        ],
      });
    });
    it('should return errors array of customerId,itemId errors', () => {
      const body = {};
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId is required',
          },
          {
            field: 'itemId',
            message: 'itemId is required',
          },
        ],
      });
    });
    it('should return errors array of customerId, itemId must be positive number errors', () => {
      const body = {
        customerId: '1',
        itemId: '1',
      };
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId must be a positive integer',
          },
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
        ],
      });
    });
    it('should return errors array of customerId, itemId must be positive number errors', () => {
      const body = {
        customerId: -2,
        itemId: -1,
      };
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'customerId',
            message: 'customerId must be a positive integer',
          },
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
        ],
      });
    });
    it('should return errors array of itemId must be positive number errors', () => {
      const body = {
        customerId: 1,
        itemId: -1,
      };
      const result = validateDeleteCartItem(body);
      expect(result).toEqual({
        data: null,
        errors: [
          {
            field: 'itemId',
            message: 'itemId must be a positive integer',
          },
        ],
      });
    });
  });
});
