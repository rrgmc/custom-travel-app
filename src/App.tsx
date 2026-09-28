import { singleDestination, trip } from "./data";
import { t } from "./lib/i18n";
import { href, useRoute, type Page } from "./lib/router";
import { Icon } from "./components/Icon";
import { DestinationDetail, DestinationsList } from "./screens/Destinations";
import { AttractionDetail } from "./screens/Attraction";
import { ReservationDetail, ReservationsList } from "./screens/Reservations";
import { DayPlanDetail } from "./screens/DayPlans";

type Tab = "destinations" | "reservations";
const TABS: Tab[] = ["destinations", "reservations"];
const tabOf = (page: Page): Tab => (page === "attractions" || page === "plans" ? "destinations" : page);

export function App() {
  const route = useRoute();
  let screen;
  switch (route.page) {
    case "attractions": screen = <AttractionDetail key={route.id} id={route.id ?? ""} />; break;
    case "plans": screen = <DayPlanDetail key={route.id} id={route.id ?? ""} />; break;
    case "reservations": screen = route.id ? <ReservationDetail key={route.id} id={route.id} /> : <ReservationsList />; break;
    default:
      // With a single place to stay, its page is the home screen instead of a one-item list.
      screen = route.id || singleDestination
        ? <DestinationDetail key={route.id ?? singleDestination!.id} id={route.id ?? singleDestination!.id} tab={route.tab} />
        : <DestinationsList />;
  }
  const isHome = route.page === "destinations" && (!route.id || route.id === singleDestination?.id);
  const isDetail = !!route.id && !isHome;
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
            <span>{tab === "destinations" && singleDestination ? singleDestination.name : t[tab]}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
