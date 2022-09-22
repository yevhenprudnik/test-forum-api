export interface GoogleUser {
  id: number,
  email: string,
  name: string,
  given_name?: string,
  family_name?: string,
  picture: string,
}

export interface FacebookUser {
  id: number,
  email: string,
  name: string,
  first_name?: string,
  last_name?: string,
  picture:  { data: { url: string } },
}