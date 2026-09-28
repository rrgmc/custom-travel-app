import type { DayPlan } from "../types";
import { attractionById, planRain, planTowns } from "../data";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { LengthTag, PriorityTag, RainTag } from "./Attraction";

/** Day plans: good combinations of attractions for a day or half day, to pick from on the day. */
export function DayPlanList({ plans }: { plans: DayPlan[] }) {
  return (
    <ol className="plans">
      {plans.map((plan) => {
        const rain = planRain(plan);
        const towns = planTowns(plan);
        return (
          <li key={plan.id} id={`plan-${plan.id}`} className="plan">
            <h2>{plan.title}</h2>
            <p className="row-meta">
              {plan.length && <LengthTag length={plan.length} />}
              {rain && <RainTag rain={rain} />}
              {towns.length > 0 && <span className="muted">{towns.join(", ")}</span>}
            </p>
            {plan.notes && <div className="plan-notes"><RichText text={plan.notes} /></div>}
            <ul className="rows">
              {plan.attractions.map((id) => {
                const a = attractionById.get(id);
                if (!a) return null;
                return (
                  <li key={id}>
                    <a href={href("attractions", id)}>
                      <span className="row-main">
                        <strong>{a.name}</strong>
                        {(a.priority === "must" || a.travelTime) && (
                          <span className="row-meta">
                            {a.priority === "must" && <PriorityTag p={a.priority} />}
                            {a.travelTime && <span className="muted">{a.travelTime}</span>}
                          </span>
                        )}
                      </span>
                      <Icon name="chevron" size={18} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
