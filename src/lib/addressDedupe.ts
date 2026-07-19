// Shared matching rule for saved addresses: two entries are considered the
// same only when BOTH the address fields and the phone number match. This
// lets a customer save the same address with a different phone (or vice
// versa) while still preventing exact address+phone duplicates.

const ADDRESS_MATCH_KEYS = ['doorNumber', 'streetName', 'city', 'state', 'pincode'] as const;

interface AddressPhoneFields {
  doorNumber?: unknown;
  streetName?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  phone?: unknown;
}

function normalize(v: unknown): string {
  return ((v as string) || '').toLowerCase().trim();
}

export function isSameAddressAndPhone(a: AddressPhoneFields, b: AddressPhoneFields): boolean {
  return ADDRESS_MATCH_KEYS.every((k) => normalize(a[k]) === normalize(b[k])) && normalize(a.phone) === normalize(b.phone);
}
