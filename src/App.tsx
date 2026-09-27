import { schedule, trip } from "./data";
import { t } from "./lib/i18n";
import { href, useRoute, type Page } from "./lib/router";
import { Icon } from "./components/Icon";
import { DestinationDetail, DestinationsList } from "./screens/Destinations";
import { AttractionDetail } from "./screens/Attraction";
import { ReservationDetail, ReservationsList } from "./screens/Reservations";
import { ScheduleScreen } from "./screens/Schedule";

type Tab = "destinations" | "reservations" | "schedule";
// The Schedule tab only exists when the trip has one.
const TABS: Tab[] = schedule.length ? ["destinations", "reservations", "schedule"] : ["destinations", "reservations"];
const tabOf = (page: Page): Tab => (page === "attractions" ? "destinations" : page);

export function App() {
  const route = useRoute();
  let screen;
  switch (route.page) {
    case "attractions": screen = <AttractionDetail key={route.id} id={route.id ?? ""} />; break;
    case "reservations": screen = route.id ? <ReservationDetail key={route.id} id={route.id} /> : <ReservationsList />; break;
    case "schedule": screen = <ScheduleScreen date={route.id} />; break;
    default: screen = route.id ? <DestinationDetail key={route.id} id={route.id} /> : <DestinationsList />;
  }
  const isDetail = !!route.id && route.page !== "schedule";
  return (
    <div className="app">
      <header className="topbar">
        {isDetail ? (
          <button className="back" onClick={() => (history.length > 1 ? history.back() : (location.hash = href(tabOf(route.page))))}>
            <Icon name="back" size={20} /> {t.back}
          </button>
        ) : (
          <span className="trip-name">{trip.title}</span>
        )}
      </header>
      <main>{screen}</main>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((tab) => (
          <a key={tab} href={href(tab)} aria-current={tabOf(route.page) === tab ? "page" : undefined}>
            <Icon name={tab} />
            <span>{t[tab]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
