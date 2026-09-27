import { useEffect, useState } from "react";

// Hash routes, so the Android back button walks back through screens.
//   #/today  #/days  #/days/2026-10-10  #/bookings  #/bookings/<id>  #/places  #/places/<id>  #/info
export type Route = { tab: "today" | "days" | "bookings" | "places" | "info"; id?: string };

function parse(): Route {
  const [, tab, id] = location.hash.replace(/^#/, "").split("/");
  const tabs = ["today", "days", "bookings", "places", "info"] as const;
  return { tab: (tabs as readonly string[]).includes(tab) ? (tab as Route["tab"]) : "today", id: id ? decodeURIComponent(id) : undefined };
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

export const href = (tab: Route["tab"], id?: string) => `#/${tab}${id ? `/${encodeURIComponent(id)}` : ""}`;
