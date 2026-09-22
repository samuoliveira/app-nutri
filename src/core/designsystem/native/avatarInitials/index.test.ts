import { avatarInitials } from './index';

describe('avatarInitials', () => {
  it('usa primeiro e último nome', () => {
    expect(avatarInitials('Ana Silva')).toBe('AS');
    expect(avatarInitials('Maria da Costa Lima')).toBe('ML');
  });

  it('aguenta nome único e string vazia', () => {
    expect(avatarInitials('Ana')).toBe('A');
    expect(avatarInitials('   ')).toBe('?');
  });
});
