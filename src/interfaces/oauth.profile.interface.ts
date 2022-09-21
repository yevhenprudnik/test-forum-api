export interface OauthProfileInterface {
  id: number,
  email: string,
  name: string,
  given_name?: string,
  family_name?: string,
  first_name?: string,
  last_name?: string,
  picture?
}