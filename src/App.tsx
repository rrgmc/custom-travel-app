import { useRoute, href, type Route } from "./lib/router";
import { t } from "./lib/i18n";
import { trip } from "./data";
import { Icon } from "./components/Icon";
import { Today } from "./screens/Today";
import { DaysList, DayDetail } from "./screens/Days";
import { BookingsList, BookingDetail } from "./screens/Bookings";
import { PlacesList, PlaceDetail } from "./screens/Places";
import { Info } from "./screens/Info";

const TABS: Route["tab"][] = ["today", "days", "bookings", "places", "info"];

export function App() {
  const route = useRoute();
  let screen;
  switch (route.tab) {
    case "days": screen = route.id ? <DayDetail key={route.id} date={route.id} /> : <DaysList />; break;
    case "bookings": screen = route.id ? <BookingDetail id={route.id} /> : <BookingsList />; break;
    case "places": screen = route.id ? <PlaceDetail id={route.id} /> : <PlacesList />; break;
    case "info": screen = <Info />; break;
    default: screen = <Today />;
  }
  return (
    <div className="app">
      <header className="topbar">
        {route.id ? (
          <button className="back" onClick={() => (history.length > 1 ? history.back() : (location.hash = href(route.tab)))}>
            <Icon name="back" size={20} /> {t.back}
          </button>
        ) : (
          <span className="trip-name">{trip.title}</span>
        )}
      </header>
      <main>{screen}</main>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((tab) => (
          <a key={tab} href={href(tab)} aria-current={route.tab === tab ? "page" : undefined}>
            <Icon name={tab} />
            <span>{t[tab]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
