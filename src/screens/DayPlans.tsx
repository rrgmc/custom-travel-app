import { Fragment } from "react";
import type { DayPlan } from "../types";
import { attractionById, destinationById, planById, planRain, planTowns } from "../data";
import { t } from "../lib/i18n";
import { href } from "../lib/router";
import { Icon } from "../components/Icon";
import { RichText } from "../components/Text";
import { LengthTag, PriorityTag, RainTag } from "./Attraction";
import { AskClaudeButton } from "../components/Actions";
import { planQuestion } from "../lib/prompts";
import { DoneCheck, MarkButtons, MarkMenu } from "../components/Marks";
import { removedLast, useMarks } from "../lib/marks";

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

/**
 * Day plans as compact cards: title, tags and the attractions as pills. Tapping opens the plan.
 * Removed plans go to the bottom, faded; done and removed attractions show on their pills.
 */
export function DayPlanList({ plans }: { plans: DayPlan[] }) {
  const markOf = useMarks();
  const sorted = removedLast(plans, "plan", markOf);
  const firstRemoved = sorted.find((p) => markOf("plan", p.id) === "removed");
  return (
    <ul className="plans">
      {sorted.map((plan) => {
        const mark = markOf("plan", plan.id);
        return (
          <Fragment key={plan.id}>
            {plan === firstRemoved && <li className="list-divider">{t.removed}</li>}
            <li className={`markable${mark ? ` is-${mark}` : ""}`}>
              <a className="plan-card" href={href("plans", plan.id)}>
                <span className="row-main">
                  <strong>{mark === "done" && <DoneCheck />}{plan.title}</strong>
                  <PlanTags plan={plan} />
                  <span className="chips">
                    {plan.attractions.map((id) => {
                      const a = attractionById.get(id);
                      if (!a) return null;
                      const am = markOf("attraction", id);
                      const cls = ["chip", a.priority === "must" && "chip-must", am && `chip-${am}`].filter(Boolean).join(" ");
                      return (
                        <span key={id} className={cls}>
                          {am === "done" ? <Icon name="check" size={11} /> : a.priority === "must" && <Icon name="star" size={11} />}
                          {a.name}
                        </span>
                      );
                    })}
                  </span>
                </span>
              </a>
              <MarkMenu kind="plan" id={plan.id} name={plan.title} />
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}

/** One day plan: why these go together, then its attractions in order. */
export function DayPlanDetail({ id }: { id: string }) {
  const markOf = useMarks();
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
      <MarkButtons kind="plan" id={plan.id} />
      {plan.notes && <div className="note"><RichText text={plan.notes} /></div>}
      <AskClaudeButton question={() => planQuestion(plan)} />
      <ul className="rows">
        {plan.attractions.map((aid) => {
          const a = attractionById.get(aid);
          if (!a) return null;
          // The plan's order matters (driving order), so removed attractions stay in place, faded.
          const mark = markOf("attraction", aid);
          return (
            <li key={aid} className={`markable${mark ? ` is-${mark}` : ""}`}>
              <a href={href("attractions", aid)}>
                <span className="row-main">
                  <strong>{mark === "done" && <DoneCheck />}{a.name}</strong>
                  {(a.priority === "must" || a.travelTime) && (
                    <span className="row-meta">
                      {a.priority === "must" && <PriorityTag p={a.priority} />}
                      {a.travelTime && <span className="muted">{a.travelTime}</span>}
                    </span>
                  )}
                  {a.description && <span className="muted clamp">{a.description}</span>}
                </span>
              </a>
              <MarkMenu kind="attraction" id={aid} name={a.name} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
