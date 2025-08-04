export const auth = jest.fn()
export const signIn = jest.fn()
export const signOut = jest.fn()

const nextAuthMock = {
  auth,
  signIn,
  signOut,
}

export default nextAuthMock
