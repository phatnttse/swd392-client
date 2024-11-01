import { UserAccount } from './account.model';
import { Flower } from './flower.model';

export interface Feedback {
  id: number;
  user: UserAccount;
  flowerListing: Flower;
  description: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}
