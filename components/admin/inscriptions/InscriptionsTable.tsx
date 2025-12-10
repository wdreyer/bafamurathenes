// components/admin/inscriptions/InscriptionsTable.tsx
"use client";

type InscriptionRow = {
  id: string;
  formationTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  paid: boolean;
};

type Props = {
  inscriptions: InscriptionRow[];
};

export function InscriptionsTable({ inscriptions }: Props) {
  if (!inscriptions.length) {
    return <p>Aucune inscription pour l'instant.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
            Formation
          </th>
          <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
            Nom
          </th>
          <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
            Contact
          </th>
          <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
            Paiement
          </th>
        </tr>
      </thead>
      <tbody>
        {inscriptions.map((i) => (
          <tr key={i.id}>
            <td style={{ padding: "8px 4px" }}>{i.formationTitle ?? "—"}</td>
            <td style={{ padding: "8px 4px" }}>
              {i.firstName} {i.lastName}
            </td>
            <td style={{ padding: "8px 4px" }}>
              {i.email}
              <br />
              {i.phone}
            </td>
            <td style={{ padding: "8px 4px" }}>
              {i.paymentMethod} –{" "}
              <span style={{ color: i.paid ? "green" : "red" }}>
                {i.paid ? "Payé" : "Non payé"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
