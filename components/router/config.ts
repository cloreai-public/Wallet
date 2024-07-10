export const EndPoints = Object({
  base: '/',
  register: '/register',
  create: {
    new: '/create',
    recover: '/recover',
    verify: '/verify',
    finish: '/finish',
  },
  auth: {
    dashboard: '/dashboard',
    contactsManager: '/contactsManager',
    walletsManager: '/walletsManager',
    history: '/history',
    send: '/send',
    poh: '/poh',
  },
});

export function getAllPaths() {
  const paths: { open: string[]; auth: string[] } = { open: [], auth: [] };
  Object.keys(EndPoints).map(key => {
    if (typeof EndPoints[key] === 'object') {
      Object.keys(EndPoints[key]).map(k => {
        key === 'auth'
          ? paths.auth.push(EndPoints[key][k])
          : paths.open.push(EndPoints[key][k]);
      });
    } else {
      key === 'auth'
        ? paths.auth.push(EndPoints[key])
        : paths.open.push(EndPoints[key]);
    }
  });
  return { ...paths };
}
