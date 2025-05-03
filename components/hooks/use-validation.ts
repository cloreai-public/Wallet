export class Validation {
  isPassword(password: string) {
    const upperCasePattern = /[A-Z]/g;
    const lowerCasePattern = /[a-z]/g;
    const numberPattern = /\d/g;
    const symbolPattern = /[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]/g;

    const upperCaseMatches = password.match(upperCasePattern);
    const lowerCaseMatches = password.match(lowerCasePattern);
    const numberMatches = password.match(numberPattern);
    const symbolMatches = password.match(symbolPattern);

    const hasTwoUpperCase = upperCaseMatches && upperCaseMatches.length >= 2;
    const hasTwoLowerCase = lowerCaseMatches && lowerCaseMatches.length >= 2;
    const hasTwoNumbers = numberMatches && numberMatches.length >= 2;
    const hasTwoSymbols = symbolMatches && symbolMatches.length >= 2;
    const hasValidLength = password.length >= 10 && password.length <= 100;

    if (
      hasTwoUpperCase &&
      hasTwoLowerCase &&
      hasTwoNumbers &&
      hasTwoSymbols &&
      hasValidLength
    )
      return { error: false, message: '' };
    else
      return {
        error: true,
        message:
          'Password must have at least 2 uppercase, 2 lowercase, 2 numbers, 2 symbols, and be 10-100 characters long',
      };
  }

  isAddress(address: string) {
    const validAddress = new RegExp('^[A][a-km-zA-HJ-NP-Z1-9]{25,34}$');
    if (validAddress.test(address)) return { error: false, message: '' };
    else return { error: true, message: 'Invalid Address' };
  }

  isName(name: string) {
    if (name.length >= 3 && name.length <= 10)
      return { error: false, message: '' };
    else return { error: true, message: 'Name must be 3-10 characters long' };
  }
}
