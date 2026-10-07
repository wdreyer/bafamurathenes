import { trainerDocumentsOf } from "@/lib/uploadTrainerDocument";
import type { Trainer, TrainerDocument } from "@/lib/types";

export type DocumentStatus = "pending" | "validated" | "rejected";

export const documentStatus = (trainer: Trainer, document: TrainerDocument): DocumentStatus =>
  trainer.documentReviews?.[document.id]?.status || "pending";

const plain = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Documents every file needs, recognised from the name the trainer gave them ("Diplôme BAFA", "Carte d'identité"…),
 * whether they were sent with the named documents or the former profile form.
 */
const REQUIRED_DOCUMENTS = [
  { label: "Diplôme", matches: /diplome|bafa|bafd/ },
  { label: "Pièce d’identité", matches: /identite|passeport|titre de sejour|\bcni\b/ },
];

export function trainerProfileProgress(trainer: Trainer) {
  const information = [
    trainer.firstName,
    trainer.lastName,
    trainer.email,
    trainer.phone,
    trainer.birthDate,
    trainer.birthPlace,
    trainer.address,
    // Typed in the profile form like any other field, so it counts as information, not as an uploaded document.
    trainer.socialSecurityNumberPath || trainer.hasSocialSecurityNumber,
  ];
  const all = trainerDocumentsOf(trainer);
  // A refused document doesn't count: it has to be sent again.
  const usable = all.filter((document) => documentStatus(trainer, document) !== "rejected");
  const missingDocumentLabels = REQUIRED_DOCUMENTS
    .filter((required) => !usable.some((document) => required.matches.test(plain(document.label))))
    .map((required) => required.label);
  const missingInformation = information.filter((value) => !value).length;
  const missingDocuments = missingDocumentLabels.length;
  return {
    informationCount: information.length - missingInformation,
    informationTotal: information.length,
    documentCount: REQUIRED_DOCUMENTS.length - missingDocuments,
    documentTotal: REQUIRED_DOCUMENTS.length,
    missingInformation,
    missingDocuments,
    missingDocumentLabels,
    documentsToReview: all.filter((document) => documentStatus(trainer, document) === "pending").length,
    documentsRejected: all.length - usable.length,
    complete: missingInformation === 0 && missingDocuments === 0,
  };
}

/** "2 informations et Diplôme à ajouter" — what a file still lacks, for the banners. */
export function missingSummary(progress: ReturnType<typeof trainerProfileProgress>) {
  const parts = [
    progress.missingInformation ? `${progress.missingInformation} information${progress.missingInformation > 1 ? "s" : ""}` : "",
    progress.missingDocumentLabels.join(", "),
  ].filter(Boolean);
  return `${parts.join(" et ")} à ajouter`;
}
