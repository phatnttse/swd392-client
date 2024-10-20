import { CanActivateChildFn } from '@angular/router';

export const adminGuard: CanActivateChildFn = (childRoute, state) => {
  return true;
};
