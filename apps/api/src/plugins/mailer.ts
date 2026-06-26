import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

type EmailEvent = 'status_changed' | 'new_comment' | 'ticket_assigned'

interface TicketEmailOptions {
  to:          string
  userName:    string
  ticketId:    string
  ticketTitle: string
  eventType:   EmailEvent
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
  if (!process.env.SMTP_HOST) {
    console.log(`[mailer] Email não enviado (SMTP não configurado): ${opts.eventType} → ${opts.to}`)
    return
  }

  const { subject, html } = buildEmail(opts)

  try {
    await transporter.sendMail({
      from:    `"Helpdesk" <${process.env.SMTP_USER}>`,
      to:      opts.to,
      subject,
      html,
    })
  } catch (error) {
    console.error('[mailer] Erro ao enviar email:', error)
  }
}
// ← função fechada corretamente aqui

export async function sendInviteEmail(opts: {
  to:    string
  name:  string
  token: string
  role:  string
}): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log(`[mailer] Convite não enviado (SMTP não configurado)`)
    console.log(`[mailer] Link de convite: ${process.env.FRONTEND_URL}/accept-invite?token=${opts.token}`)
    return
  }

  const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${opts.token}`

  try {
    await transporter.sendMail({
      from:    `"Helpdesk" <${process.env.SMTP_USER}>`,
      to:      opts.to,
      subject: '[Helpdesk] Você foi convidado',
      html: `
        <p>Olá, ${opts.name}.</p>
        <p>Você foi convidado para acessar o sistema de chamados como <strong>${opts.role}</strong>.</p>
        <p>Clique no link abaixo para definir sua senha e ativar sua conta:</p>
        <p><a href="${inviteUrl}">Ativar minha conta</a></p>
        <p>Este link expira em <strong>3 dias</strong>.</p>
        <p>Se você não esperava este convite, ignore este email.</p>
      `,
    })
  } catch (error) {
    console.error('[mailer] Falha ao enviar convite:', error)
  }
}