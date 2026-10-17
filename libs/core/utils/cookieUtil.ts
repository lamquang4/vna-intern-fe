import Cookies from "js-cookie";

export const cookieUtil = {
  get: (name: string): string | undefined => Cookies.get(name),

  set: (
    name: string,
    value: string,
    options?: Cookies.CookieAttributes,
  ): void => {
    Cookies.set(name, value, options);
  },

  remove: (name: string, options?: Cookies.CookieAttributes): void => {
    Cookies.remove(name, options);
  },
};
