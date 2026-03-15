export const ADMIN_EMAIL = "vk149763@gmail.com";

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};
