import { ENTITIES } from "../../../../prisma/entities";
import { NOT_FOUND } from "../../../shared_infrastructure/error/error.execption";
import { AddressRepository } from "../Repositories/address.repository";

export class AddressService {
  static async getAddressByCustomerId(customerId: number, addressId: number) {
    const address = await AddressRepository.findAddressByIdAndCustomerId(
      addressId,
      customerId,
    );
    if (!address) {
      throw new NOT_FOUND(ENTITIES.ADDRESS);
    }
  }
}
