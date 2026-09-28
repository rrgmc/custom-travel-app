import { useEffect, useState } from "react";

// Hash routes, so the Android back button walks back through screens.
//   #/destinations  #/destinations/<id>  #/destinations/<id>/<tab>  #/attractions/<id>
//   #/reservations  #/reservations/<id>  #/plans/<id>
export type Page = "destinations" | "attractions" | "reservations" | "plans";
export type Route = { page: Page; id?: string; tab?: string };

const PAGES: readonly string[] = ["destinations", "attractions", "reservations", "plans"];

function parse(): Route {
  const [, page, id, tab] = location.hash.replace(/^#/, "").split("/");
  if (!PAGES.includes(page)) return { page: "destinations" };
  const dec = (v?: string) => (v ? decodeURIComponent(v) : undefined);
  return { page: page as Page, id: dec(id), tab: dec(tab) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const href = (page: Page, id?: string, tab?: string) =>
  `#/${page}${id ? `/${encodeURIComponent(id)}` : ""}${id && tab ? `/${encodeURIComponent(tab)}` : ""}`;
