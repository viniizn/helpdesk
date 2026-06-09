import nodemailer from 'nodemailer';

//Transportar é a conexão com o servidor SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true", // true para 465, false para outras portas
    //secure true usa porta 465 (SSL direto)
    //secure false usa porta 587 (STARTTLS == mais comum em dev)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

type EmailEvent = "status_changed" | "new_comment" | "ticket_assigned"

interface TicketEmailOptions {
  to:          string
  userName:    string
  ticketId:    string
  ticketTitle: string
  eventType:   EmailEvent
  // Opcional — só usado quando status muda
  newStatus?:  string
}

function buildEmail(opts: TicketEmailOptions): { subject: string; html: string } {
  const ticketUrl = `${process.env.FRONTEND_URL}/tickets/${opts.ticketId}`

  const messages: Record<EmailEvent, { subject: string; html: string }> = {
    status_changed: {
      subject: `[Helpdesk] Chamado atualizado: ${opts.ticketTitle}`,
      html: `
        <p>Olá, ${opts.userName}.</p>
        <p>O status do seu chamado <strong>${opts.ticketTitle}</strong> 
           foi atualizado para <strong>${opts.newStatus}</strong>.</p>
        <p><a href="${ticketUrl}">Ver chamado</a></p>
      `,
    },
    new_comment: {
      subject: `[Helpdesk] Nova resposta: ${opts.ticketTitle}`,
      html: `
        <p>Olá, ${opts.userName}.</p>
        <p>Há uma nova resposta no seu chamado <strong>${opts.ticketTitle}</strong>.</p>
        <p><a href="${ticketUrl}">Ver chamado</a></p>
      `,
    },
    ticket_assigned: {
      subject: `[Helpdesk] Chamado atribuído a você: ${opts.ticketTitle}`,
      html: `
        <p>O chamado <strong>${opts.ticketTitle}</strong> foi atribuído a você.</p>
        <p><a href="${ticketUrl}">Ver chamado</a></p>
      `,
    },
  }

  return messages[opts.eventType]
}

export async function sendTicketStatusEmail(opts: TicketEmailOptions): Promise<void> {
    //Em desenvolvimento, se SMTP nao estiver configurado, apenas loga
    //Sem quebrar fluxo por falha de email
    if (!process.env.SMTP_HOST) {
        console.log(`[mailer] Email não enviado (SMTP não configurado): ${opts.eventType} → ${opts.to}`)
        return;
    }

    const { subject, html } = buildEmail(opts)

    try {
        await transporter.sendMail({
            from: `"Helpdesk" <${process.env.SMTP_USER}>`,
            to: opts.to,
            subject,
            html,
        })
    } catch (error) {
        console.error("[mailer] Erro ao enviar email:", error)
    }
}