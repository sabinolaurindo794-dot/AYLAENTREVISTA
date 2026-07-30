import { Agendamento } from "../types";

export function getNotificationDetails(agendamento: Agendamento) {
  const formattedDate = agendamento.dataHora
    ? agendamento.dataHora.replace("T", " às ")
    : "Data a definir";

  const accessLink = `${window.location.origin}?candidato=${encodeURIComponent(
    agendamento.candidatoNome
  )}&area=${encodeURIComponent(agendamento.area)}&empresa=${encodeURIComponent(
    agendamento.empresa
  )}`;

  const emailSubject = `[AYLAENTREVISTA] Convite para Entrevista Virtual: ${agendamento.area} (${agendamento.empresa})`;
  const emailBody = `Exmo(a). Sr(a). ${agendamento.candidatoNome},

Foi agendada a sua entrevista de emprego com a banca virtual AYLAENTREVISTA.

Detalhes do Agendamento:
• Área / Vaga: ${agendamento.area}
• Empresa: ${agendamento.empresa}
• Nível de Exigência: ${agendamento.nivel.toUpperCase()}
• Data & Hora: ${formattedDate}

Aceda à sala de entrevista através do seguinte link:
${accessLink}

Recomendações:
- Certifique-se de que o seu microfone e áudio estão funcionais.
- Mantenha um ambiente tranquilo para a sessão de entrevista.

Atenciosamente,
Banca Virtual de Recrutamento - AYLAENTREVISTA`;

  const smsBody = `Olá ${agendamento.candidatoNome}! A sua entrevista de ${agendamento.area} (${agendamento.empresa}) está agendada para ${formattedDate}. Link de acesso: ${accessLink}`;

  return { formattedDate, accessLink, emailSubject, emailBody, smsBody };
}

export function openCandidateEmail(agendamento: Agendamento) {
  const { emailSubject, emailBody } = getNotificationDetails(agendamento);
  const mailUrl = `mailto:${encodeURIComponent(agendamento.candidatoEmail)}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;
  window.open(mailUrl, "_blank");
}

export function openCandidateSMSOrWhatsApp(agendamento: Agendamento) {
  const { smsBody, emailSubject, emailBody } = getNotificationDetails(agendamento);
  const rawPhone = agendamento.candidatoTelefone
    ? agendamento.candidatoTelefone.replace(/[^0-9]/g, "")
    : "";
  if (rawPhone) {
    window.open(`https://wa.me/${rawPhone}?text=${encodeURIComponent(smsBody)}`, "_blank");
  } else {
    window.open(
      `mailto:${encodeURIComponent(agendamento.candidatoEmail)}?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(smsBody)}`,
      "_blank"
    );
  }
}
