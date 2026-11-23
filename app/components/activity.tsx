"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
  repository: string;
  sha: string;
  title: string;
  url: string;
  date: string;
};

function validItem(item: ActivityItem) {
  return item && typeof item.repository === "string" &&
    /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(item.repository) &&
    typeof item.sha === "string" && /^[a-f0-9]{40}$/.test(item.sha) &&
    typeof item.title === "string" && item.title.length > 0 && item.title.length <= 180 &&
    item.url === `https://github.com/${item.repository}/commit/${item.sha}` &&
    typeof item.date === "string" && Number.isFinite(Date.parse(item.date));
}

export function Activity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/activity.json", { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error("Activity unavailable");
        return response.json();
      })
      .then(data => {
        if (data.version === 1 && Array.isArray(data.items)) {
          setItems(data.items.filter(validItem).slice(0, 5));
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div className="activity">
      {items.length > 0 ? (
        <ul className="activity-list">
          {items.map(item => (
            <li className="activity-item" key={`${item.repository}/${item.sha}`}>
              <time className="activity-date" dateTime={item.date}>
                {new Date(item.date).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
                })}
              </time>
              <div className="activity-detail">
                <a className="activity-title" href={item.url}>{item.title}</a>
                <span className="activity-repository">{item.repository}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="activity-empty">Public project updates will appear here. <a href="https://github.com/BiscuitNuke/KSWU">View the portfolio source on GitHub.</a></p>
      )}
    </div>
  );
}

export default Activity;
