import type { Trainer } from "@/lib/types";

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
  const documents = [
    trainer.diplomaPath || trainer.diplomaUrl,
    trainer.identityDocumentPath || trainer.identityDocumentUrl,
  ];
  const missingInformation = information.filter((value) => !value).length;
  const missingDocuments = documents.filter((value) => !value).length;
  return {
    informationCount: information.length - missingInformation,
    informationTotal: information.length,
    documentCount: documents.length - missingDocuments,
    documentTotal: documents.length,
    missingInformation,
    missingDocuments,
    complete: missingInformation === 0 && missingDocuments === 0,
  };
}
