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
  ];
  const documents = [
    trainer.diplomaPath || trainer.diplomaUrl,
    trainer.identityDocumentPath || trainer.identityDocumentUrl,
    trainer.socialSecurityNumberPath || trainer.hasSocialSecurityNumber,
  ];
  const missingInformation = information.filter((value) => !value).length;
  const missingDocuments = documents.filter((value) => !value).length;
  return {
    informationCount: information.length - missingInformation,
    documentCount: documents.length - missingDocuments,
    missingInformation,
    missingDocuments,
    complete: missingInformation === 0 && missingDocuments === 0,
  };
}
