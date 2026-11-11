# Números do momento: conversas, atividades e cartões que a pessoa vê.
class CrmAi::Tools::ResumoAtendimento < CrmAi::Tools::Base
  description 'Resumo do momento: conversas abertas, sem responsável, aguardando resposta e minhas; atividades e cartões ' \
              'do Kanban pendentes, atrasados e para hoje. Use primeiro para perguntas gerais sobre a operação.'

  def self.tool_name
    'resumo_atendimento'
  end

  private

  def run
    today = @access.today
    { hoje: local_date(today), conversas: conversations, atividades: activities(today), cartoes: cards(today) }
  end

  def conversations
    open = @access.conversations.where(status: :open)
    {
      abertas: open.count, pendentes: @access.conversations.where(status: :pending).count,
      sem_responsavel: open.where(assignee_id: nil).count, aguardando_resposta: open.where.not(waiting_since: nil).count,
      minhas_abertas: open.where(assignee_id: @access.user.id).count
    }
  end

  def activities(today)
    pending = @access.work_activities.where.not(status: 'done')
    {
      pendentes: pending.count, atrasadas: pending.where(due_on: ...today).count, para_hoje: pending.where(due_on: today).count,
      minhas_pendentes: pending.where(assignee_id: @access.user.id).count
    }
  end

  def cards(today)
    open = @access.kanban_items.where(status: 'open')
    { abertos: open.count, atrasados: open.where(due_on: ...today).count, vencem_hoje: open.where(due_on: today).count }
  end
end
