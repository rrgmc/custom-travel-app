import type { DayPlan } from "../types";
import { attractionById, destinationById, planById, planRain, planTowns } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { LengthTag, PriorityTag, RainTag } from "./Attraction";
import { AskClaudeButton } from "../components/Actions";
import { planQuestion } from "../lib/prompts";

/** Length, rain and towns of a plan, as one line of tags. */
function PlanTags({ plan }: { plan: DayPlan }) {
  const rain = planRain(plan);
  const towns = planTowns(plan);
  return (
    <span className="row-meta">
      {plan.length && <LengthTag length={plan.length} />}
      {rain && <RainTag rain={rain} />}
      {towns.length > 0 && <span className="muted">{towns.join(", ")}</span>}
    </span>
  );
}

/** Day plans as compact cards: title, tags and the attractions as pills. Tapping opens the plan. */
export function DayPlanList({ plans }: { plans: DayPlan[] }) {
  return (
    <ul className="plans">
      {plans.map((plan) => (
        <li key={plan.id}>
          <a className="plan-card" href={href("plans", plan.id)}>
            <span className="row-main">
              <strong>{plan.title}</strong>
              <PlanTags plan={plan} />
              <span className="chips">
                {plan.attractions.map((id) => {
                  const a = attractionById.get(id);
                  if (!a) return null;
                  return (
                    <span key={id} className={`chip${a.priority === "must" ? " chip-must" : ""}`}>
                      {a.priority === "must" && <Icon name="star" size={11} />}
                      {a.name}
                    </span>
                  );
                })}
              </span>
            </span>
            <Icon name="chevron" size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One day plan: why these go together, then its attractions in order. */
export function DayPlanDetail({ id }: { id: string }) {
  const plan = planById.get(id);
  if (!plan) return <p className="empty">{t.notFound}: {id}</p>;
  const dest = destinationById.get(plan.destination);
  return (
    <>
      <section className="hero">
        <p className="hero-count">
          {dest && <a href={href("destinations", dest.id, "plans")}>{dest.name}</a>} · {t.plans}
        </p>
        <h1>{plan.title}</h1>
        <p className="hero-tags"><PlanTags plan={plan} /></p>
      </section>
      {plan.notes && <div className="note"><RichText text={plan.notes} /></div>}
      <AskClaudeButton question={() => planQuestion(plan)} />
      <ul className="rows">
        {plan.attractions.map((aid) => {
          const a = attractionById.get(aid);
          if (!a) return null;
          return (
            <li key={aid}>
              <a href={href("attractions", aid)}>
                <span className="row-main">
                  <strong>{a.name}</strong>
                  {(a.priority === "must" || a.travelTime) && (
                    <span className="row-meta">
                      {a.priority === "must" && <PriorityTag p={a.priority} />}
                      {a.travelTime && <span className="muted">{a.travelTime}</span>}
                    </span>
                  )}
                  {a.description && <span className="muted clamp">{a.description}</span>}
                </span>
                <Icon name="chevron" size={18} />
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}
