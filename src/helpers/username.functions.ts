export const usernameFunctions = [
  profileName => profileName.replace(/\s/g, ''),
  profileName => profileName.replace(/\s/g, '_'),
  profileName => profileName.replace(/\s/g, '.'),
  profileName => profileName.replace(/\s/g, '-'),
  profileName => profileName.toLocaleLowerCase().replace(/\s/g, ''),
  profileName => profileName.toLocaleLowerCase().replace(/\s/g, '_'),
  profileName => profileName.toLocaleLowerCase().replace(/\s/g, '.'),
  profileName => profileName.toLocaleLowerCase().replace(/\s/g, '-'),
]