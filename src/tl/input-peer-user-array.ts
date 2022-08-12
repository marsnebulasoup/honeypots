import bigInt from 'big-integer';
import { BigInteger } from 'big-integer';
import { Api } from 'telegram';

export class InputPeerUserArray extends Array<Api.InputPeerUser> {
  constructor(...args: Api.InputPeerUser[]) {
    super(...args);
  }

  includes(searchElement: Api.InputPeerUser, fromIndex?: number): boolean {
    return this.slice(fromIndex).some(id => id.userId === searchElement.userId);
  }

  includesId(searchElement: BigInteger, fromIndex?: number): boolean {   
    return this.slice(fromIndex).some(id => id.userId.toString() === searchElement.toString());
  }
}