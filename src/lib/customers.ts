import type { Customer } from "./types";

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Asha B.", personaId: "maya", visits: 27, points: 54, lastVisit: "Yesterday", note: "Corner booth, oat milk, always the tart one", since: "Sep 2024" },
  { id: "c2", name: "Luis M.", personaId: "maya", visits: 18, points: 36, lastVisit: "Today", note: "Charges a laptop for three hours, tips in ones", since: "Jan 2025" },
  { id: "c3", name: "June K.", personaId: "maya", visits: 12, points: 20, lastVisit: "3 days ago", note: "Asks what's least sweet before she sits", since: "Mar 2025" },
  { id: "c4", name: "Omar T.", personaId: "maya", visits: 9, points: 14, lastVisit: "Last week", note: "Finals regular. Will try coffee in dessert", since: "Apr 2025" },
  { id: "c5", name: "Riley & Jen", personaId: "noah", visits: 4, points: 8, lastVisit: "Saturday", note: "Shared a spoon. Took a picture by the window", since: "Aug 2025" },
  { id: "c6", name: "Chris P.", personaId: "noah", visits: 6, points: 12, lastVisit: "Friday", note: "Keeps bringing different people. Order has to look good", since: "Jun 2025" },
  { id: "c7", name: "Mina S.", personaId: "noah", visits: 3, points: 6, lastVisit: "2 weeks ago", note: "Asked if the top was 'date appropriate'", since: "Sep 2025" },
  { id: "c8", name: "The Friday table", personaId: "helen", visits: 41, points: 88, lastVisit: "Last Friday", note: "Four chairs, one standing order, apple if possible", since: "2011" },
  { id: "c9", name: "Mr. Alvarez", personaId: "helen", visits: 22, points: 40, lastVisit: "Sunday", note: "Wants what his wife used to order", since: "2018" },
  { id: "c10", name: "Naomi & Deb", personaId: "helen", visits: 16, points: 30, lastVisit: "Last Friday", note: "Reunion that never ended. Hate surprises", since: "2016" },
  { id: "c11", name: "Felix R.", personaId: "theo", visits: 11, points: 28, lastVisit: "Yesterday", note: "Wrote 'finally' on a napkin once", since: "Feb 2025" },
  { id: "c12", name: "Ivy Chen", personaId: "theo", visits: 8, points: 22, lastVisit: "2 days ago", note: "Posts the garnish before the first bite", since: "May 2025" },
  { id: "c13", name: "Tara N.", personaId: "priya", visits: 14, points: 26, lastVisit: "Today", note: "Walks over in cool-down. Fruit or nothing", since: "Nov 2024" },
  { id: "c14", name: "Ben Q.", personaId: "priya", visits: 7, points: 12, lastVisit: "4 days ago", note: "Asks about sugar without sounding like he asks", since: "Jul 2025" },
  { id: "c15", name: "Coach Diaz", personaId: "sam", visits: 19, points: 38, lastVisit: "Yesterday", note: "Team bus if they win. Wants crunch", since: "Oct 2024" },
  { id: "c16", name: "Big Andy", personaId: "sam", visits: 10, points: 18, lastVisit: "Monday", note: "Two spoons, one parfait, no flowers on top", since: "Dec 2024" },
];

export const STAMPS_FOR_FREE = 8;

export function stampsTowardFree(visits: number) {
  return visits % STAMPS_FOR_FREE;
}
