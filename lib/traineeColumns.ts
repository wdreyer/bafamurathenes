import { doc, FieldPath, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Extra columns of a session's trainee table, named freely by the team. They live in formationPlans/{id}
 * (read and written by admins and the session's trainers, like the trainees' own tracking fields), as
 * `traineeColumns` for the list and `traineeValues[inscriptionId][columnId]` for the cells.
 */
export type TraineeColumn = { id: string; name: string };
export type TraineeValues = Record<string, Record<string, string>>;

/** Columns a session starts with, until the team changes them. */
export const DEFAULT_TRAINEE_COLUMNS: TraineeColumn[] = [
  { id: "infos", name: "Infos à savoir" },
  { id: "chambres", name: "Chambres" },
  { id: "entretien", name: "Entretien mi-stage" },
  { id: "appreciation", name: "Appréciation" },
  { id: "numero-js", name: "Numéro J-S" },
];

export const traineeColumnsOf = (plan?: { traineeColumns?: TraineeColumn[] }) => plan?.traineeColumns ?? DEFAULT_TRAINEE_COLUMNS;

const newColumnId = () => `col-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Changes the column list from the one saved now, so two people adding columns at once both keep theirs. */
async function changeColumns(formationId: string, change: (columns: TraineeColumn[]) => TraineeColumn[]) {
  const planRef = doc(db, "formationPlans", formationId);
  await runTransaction(db, async (transaction) => {
    const current = (await transaction.get(planRef)).data() as { traineeColumns?: TraineeColumn[] } | undefined;
    transaction.update(planRef, { traineeColumns: change(traineeColumnsOf(current)), updatedAt: serverTimestamp() });
  });
}

export const addTraineeColumn = (formationId: string, name: string) =>
  changeColumns(formationId, (columns) => [...columns, { id: newColumnId(), name }]);

export const renameTraineeColumn = (formationId: string, id: string, name: string) =>
  changeColumns(formationId, (columns) => columns.map((column) => column.id === id ? { ...column, name } : column));

export const moveTraineeColumn = (formationId: string, id: string, offset: -1 | 1) =>
  changeColumns(formationId, (columns) => {
    const index = columns.findIndex((column) => column.id === id);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= columns.length) return columns;
    const next = [...columns];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

/** Removes the column from the table. Its cells stay saved in the plan, out of sight. */
export const removeTraineeColumn = (formationId: string, id: string) =>
  changeColumns(formationId, (columns) => columns.filter((column) => column.id !== id));

/** Saves one cell only, so someone editing another cell at the same time keeps their text. */
export const saveTraineeValue = (formationId: string, inscriptionId: string, columnId: string, value: string) =>
  updateDoc(doc(db, "formationPlans", formationId), new FieldPath("traineeValues", inscriptionId, columnId), value, "updatedAt", serverTimestamp());
