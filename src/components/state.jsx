import { atom } from 'recoil';

const userDataState = atom({
  key: 'userDataState',
  default: null,
});

export { userDataState };
