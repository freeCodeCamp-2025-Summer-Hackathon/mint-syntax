import { useContext } from 'react';

import { UserContext } from '../user/UserContext';

export const useUser = () => useContext(UserContext);
