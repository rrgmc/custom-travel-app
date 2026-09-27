import { useEffect, useState } from "react";

// Hash routes, so the Android back button walks back through screens.
//   #/destinations  #/destinations/<id>  #/attractions/<id>
//   #/reservations  #/reservations/<id>  #/schedule
export type Page = "destinations" | "attractions" | "reservations" | "schedule";
export type Route = { page: Page; id?: string };

const PAGES: readonly string[] = ["destinations", "attractions", "reservations", "schedule"];

function parse(): Route {
  const [, page, id] = location.hash.replace(/^#/, "").split("/");
  if (!PAGES.includes(page)) return { page: "destinations" };
  return { page: page as Page, id: id ? decodeURIComponent(id) : undefined };
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

export const href = (page: Page, id?: string) => `#/${page}${id ? `/${encodeURIComponent(id)}` : ""}`;
